import {
  Prisma,
  type PaymentMethod,
  type PrismaClient,
} from "@/app/generated/prisma/client";
import { DomainError, notFound } from "@/lib/errors";
import { formatMoney, parseMoney } from "@/lib/money";

export type RepaymentInput = {
  amount: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  requestKey: string;
};

export type AdjustmentInput = {
  amount: string;
  reason: string;
  requestKey?: string;
};

type Tx = Prisma.TransactionClient;

async function balanceOf(
  tx: Tx,
  businessId: string,
  customerId: string,
): Promise<Prisma.Decimal> {
  const sum = await tx.customerStatementEntry.aggregate({
    where: { businessId, customerId },
    _sum: { amount: true },
  });
  return sum._sum.amount ?? new Prisma.Decimal(0);
}

async function lockCustomer(tx: Tx, businessId: string, customerId: string) {
  const locked = await tx.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT id FROM "Customer" WHERE id = ${customerId} AND "businessId" = ${businessId} FOR UPDATE`,
  );
  if (locked.length === 0) {
    throw notFound("Customer not found");
  }
  return tx.customer.findUniqueOrThrow({ where: { id: customerId } });
}

export async function recordRepayment(
  db: PrismaClient,
  businessId: string,
  customerId: string,
  input: RepaymentInput,
) {
  const business = await db.business.findUniqueOrThrow({
    where: { id: businessId },
  });
  const amount = parseMoney(input.amount, business.currency);
  if (!amount.gt(0)) {
    throw new DomainError("INVALID_AMOUNT", "Amount must be above zero.", 400);
  }

  try {
    return await db.$transaction(async (tx) => {
      const replayed = await tx.payment.findUnique({
        where: {
          businessId_requestKey: { businessId, requestKey: input.requestKey },
        },
      });
      if (replayed) {
        const balance = await balanceOf(
          tx,
          businessId,
          replayed.customerId ?? customerId,
        );
        return { payment: replayed, balance, replayed: true as const };
      }

      const customer = await lockCustomer(tx, businessId, customerId);
      const balance = await balanceOf(tx, businessId, customerId);
      if (amount.gt(balance)) {
        const owed = formatMoney(balance, business.currency);
        throw new DomainError(
          "REPAYMENT_EXCEEDS_BALANCE",
          `${customer.name} owes ${owed}. Enter ${owed} or less.`,
          400,
          { balance: owed },
        );
      }

      const payment = await tx.payment.create({
        data: {
          businessId,
          customerId,
          amount,
          method: input.method,
          reference: input.reference,
          note: input.note,
          requestKey: input.requestKey,
        },
      });
      await tx.customerStatementEntry.create({
        data: {
          businessId,
          customerId,
          kind: "REPAYMENT",
          amount: amount.negated(),
          requestKey: input.requestKey,
          occurredAt: payment.occurredAt,
        },
      });

      return { payment, balance: balance.minus(amount), replayed: false as const };
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      const payment = await db.payment.findUnique({
        where: {
          businessId_requestKey: { businessId, requestKey: input.requestKey },
        },
      });
      if (payment) {
        const balance = await balanceOf(
          db,
          businessId,
          payment.customerId ?? customerId,
        );
        return { payment, balance, replayed: true as const };
      }
    }
    throw error;
  }
}

export async function recordAdjustment(
  db: PrismaClient,
  businessId: string,
  customerId: string,
  input: AdjustmentInput,
) {
  const business = await db.business.findUniqueOrThrow({
    where: { id: businessId },
  });
  const amount = parseMoney(input.amount, business.currency);
  if (amount.isZero()) {
    throw new DomainError(
      "INVALID_AMOUNT",
      "Adjustment cannot be zero.",
      400,
    );
  }

  try {
    return await db.$transaction(async (tx) => {
      if (input.requestKey) {
        const replayed = await tx.customerStatementEntry.findUnique({
          where: {
            businessId_requestKey: {
              businessId,
              requestKey: input.requestKey,
            },
          },
        });
        if (replayed) {
          const balance = await balanceOf(tx, businessId, customerId);
          return { entry: replayed, balance, replayed: true as const };
        }
      }

      await lockCustomer(tx, businessId, customerId);
      const balance = await balanceOf(tx, businessId, customerId);

      const entry = await tx.customerStatementEntry.create({
        data: {
          businessId,
          customerId,
          kind: "ADJUSTMENT",
          amount,
          reason: input.reason,
          requestKey: input.requestKey,
        },
      });

      return { entry, balance: balance.plus(amount), replayed: false as const };
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002" && input.requestKey) {
      const entry = await db.customerStatementEntry.findUnique({
        where: {
          businessId_requestKey: { businessId, requestKey: input.requestKey },
        },
      });
      if (entry) {
        const balance = await balanceOf(db, businessId, customerId);
        return { entry, balance, replayed: true as const };
      }
    }
    throw error;
  }
}
