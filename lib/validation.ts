import { z } from "zod";

const amountPattern = /^-?\d+(\.\d{1,4})?$/;

const amountString = z
  .string()
  .trim()
  .regex(amountPattern, "Invalid amount");

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(30).optional(),
  email: z.email().max(200).optional(),
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
  creditLimit: amountString.optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const repaymentSchema = z.object({
  amount: amountString,
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK"]),
  reference: z.string().trim().max(200).optional(),
  note: z.string().trim().max(500).optional(),
  requestKey: z.string().trim().min(1).max(100),
});

export const adjustmentSchema = z.object({
  amount: amountString.refine(
    (value) => Number(value) !== 0,
    "Adjustment cannot be zero",
  ),
  reason: z.string().trim().min(1).max(500),
  requestKey: z.string().trim().min(1).max(100).optional(),
});

export const listCustomersQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  owes: z.enum(["1", "true"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
