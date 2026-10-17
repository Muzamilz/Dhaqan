import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { DomainError } from "@/lib/errors";
import { formatMoney } from "@/lib/money";

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof DomainError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message: "Invalid request",
          details: error.issues,
        },
      },
      { status: 400 },
    );
  }
  console.error(error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong" } },
    { status: 500 },
  );
}

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new DomainError(
      "VALIDATION",
      "Request body must be valid JSON",
      400,
    );
  }
  return schema.parse(body);
}

type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  creditLimit: Prisma.Decimal | null;
  isActive: boolean;
  createdAt: Date;
};

export function customerJson(
  customer: CustomerRow,
  currency: string,
  balance?: Prisma.Decimal,
) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    notes: customer.notes,
    creditLimit: customer.creditLimit
      ? formatMoney(customer.creditLimit, currency)
      : null,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    ...(balance ? { balance: formatMoney(balance, currency) } : {}),
  };
}

type StatementEntryRow = {
  id: string;
  kind: string;
  amount: Prisma.Decimal;
  reason: string | null;
  occurredAt: Date;
  balanceAfter?: Prisma.Decimal;
};

export function statementEntryJson(entry: StatementEntryRow, currency: string) {
  return {
    id: entry.id,
    kind: entry.kind,
    amount: formatMoney(entry.amount, currency),
    reason: entry.reason,
    occurredAt: entry.occurredAt,
    ...(entry.balanceAfter
      ? { balanceAfter: formatMoney(entry.balanceAfter, currency) }
      : {}),
  };
}
