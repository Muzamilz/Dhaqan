import {
  Prisma,
  type PrismaClient,
} from "@/app/generated/prisma/client";
import { notFound } from "@/lib/errors";
import { parseMoney } from "@/lib/money";

export type CreateCustomerInput = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  creditLimit?: string;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput> & {
  isActive?: boolean;
};

export type CustomerWarning = { code: string; message: string };

export async function createCustomer(
  db: PrismaClient,
  businessId: string,
  input: CreateCustomerInput,
) {
  const warnings: CustomerWarning[] = [];

  if (input.phone) {
    const duplicate = await db.customer.findFirst({
      where: { businessId, phone: input.phone },
    });
    if (duplicate) {
      warnings.push({
        code: "DUPLICATE_PHONE",
        message: `Another customer already uses ${input.phone}.`,
      });
    }
  }

  const business = await db.business.findUniqueOrThrow({
    where: { id: businessId },
  });

  const customer = await db.customer.create({
    data: {
      businessId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      notes: input.notes,
      creditLimit:
        input.creditLimit !== undefined
          ? parseMoney(input.creditLimit, business.currency)
          : undefined,
    },
  });

  return { customer, warnings };
}

export async function updateCustomer(
  db: PrismaClient,
  businessId: string,
  customerId: string,
  patch: UpdateCustomerInput,
) {
  const existing = await db.customer.findFirst({
    where: { id: customerId, businessId },
  });
  if (!existing) {
    throw notFound("Customer not found");
  }

  const business = await db.business.findUniqueOrThrow({
    where: { id: businessId },
  });

  return db.customer.update({
    where: { id: customerId },
    data: {
      name: patch.name,
      phone: patch.phone,
      email: patch.email,
      address: patch.address,
      notes: patch.notes,
      isActive: patch.isActive,
      ...(patch.creditLimit !== undefined
        ? {
            creditLimit:
              patch.creditLimit === null
                ? null
                : parseMoney(patch.creditLimit, business.currency),
          }
        : {}),
    },
  });
}

export async function listCustomers(
  db: PrismaClient,
  businessId: string,
  options: { q?: string; owes?: boolean; limit: number },
) {
  const where: Prisma.CustomerWhereInput = { businessId };
  if (options.q) {
    where.OR = [
      { name: { contains: options.q, mode: "insensitive" } },
      { phone: { contains: options.q } },
    ];
  }

  const candidates = await db.customer.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const sums = await db.customerStatementEntry.groupBy({
    by: ["customerId"],
    where: {
      businessId,
      customerId: { in: candidates.map((customer) => customer.id) },
    },
    _sum: { amount: true },
  });
  const balances = new Map(
    sums.map((sum) => [
      sum.customerId,
      sum._sum.amount ?? new Prisma.Decimal(0),
    ]),
  );

  let rows = candidates.map((customer) => ({
    ...customer,
    balance: balances.get(customer.id) ?? new Prisma.Decimal(0),
  }));

  if (options.owes) {
    rows = rows.filter((row) => row.balance.gt(0));
  }

  return rows.slice(0, options.limit);
}

export async function getCustomer(
  db: PrismaClient,
  businessId: string,
  customerId: string,
) {
  const customer = await db.customer.findFirst({
    where: { id: customerId, businessId },
  });
  if (!customer) {
    throw notFound("Customer not found");
  }
  return customer;
}

export async function getCustomerDetail(
  db: PrismaClient,
  businessId: string,
  customerId: string,
) {
  const customer = await getCustomer(db, businessId, customerId);

  const entries = await db.customerStatementEntry.findMany({
    where: { businessId, customerId },
    orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
  });

  let running = new Prisma.Decimal(0);
  let totalPurchases = new Prisma.Decimal(0);
  let totalPaid = new Prisma.Decimal(0);

  const statement = entries.map((entry) => {
    running = running.plus(entry.amount);
    if (entry.kind === "SALE_ON_CREDIT") {
      totalPurchases = totalPurchases.plus(entry.amount);
    }
    if (entry.kind === "REPAYMENT") {
      totalPaid = totalPaid.plus(entry.amount.abs());
    }
    return { ...entry, balanceAfter: running };
  });

  return {
    customer,
    balance: running,
    totalPurchases,
    totalPaid,
    lastTransactionAt: entries.at(-1)?.occurredAt ?? null,
    statement: statement.reverse(),
  };
}
