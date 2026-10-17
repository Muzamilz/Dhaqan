import { Prisma } from "@/app/generated/prisma/client";

const MINOR_UNIT_DIGITS: Record<string, number> = {
  USD: 2,
  SOS: 0,
};

export function minorUnitDigits(currency: string): number {
  return MINOR_UNIT_DIGITS[currency.toUpperCase()] ?? 2;
}

export function parseMoney(value: string, currency: string): Prisma.Decimal {
  const amount = new Prisma.Decimal(value);
  return amount.toDecimalPlaces(
    minorUnitDigits(currency),
    Prisma.Decimal.ROUND_HALF_UP,
  );
}

export function formatMoney(value: Prisma.Decimal, currency: string): string {
  return value.toFixed(minorUnitDigits(currency));
}
