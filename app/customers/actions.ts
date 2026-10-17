"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { DomainError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  createCustomer,
  updateCustomer,
} from "@/lib/services/customer";
import { recordAdjustment, recordRepayment } from "@/lib/services/credit";
import { getSessionBusiness } from "@/lib/session";
import {
  adjustmentSchema,
  createCustomerSchema,
  repaymentSchema,
  updateCustomerSchema,
} from "@/lib/validation";
import type { FormState } from "./form-state";

const FIELD_MESSAGES: Record<string, string> = {
  amount: "Enter an amount like 20 or 20.50.",
  creditLimit: "Enter an amount like 100 or 100.50.",
  method: "Choose a payment method.",
  name: "Enter the customer's name.",
  reason: "Explain the reason for this adjustment.",
};

function formDataObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value.trim() !== "") {
      result[key] = value.trim();
    }
  }
  return result;
}

function fieldErrorsFrom(error: ZodError): FormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (!field || fieldErrors[field]) {
      continue;
    }
    fieldErrors[field] = FIELD_MESSAGES[field] ?? issue.message;
  }
  return { fieldErrors };
}

export async function createCustomerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createCustomerSchema.safeParse(formDataObject(formData));
  if (!parsed.success) {
    return fieldErrorsFrom(parsed.error);
  }

  const business = await getSessionBusiness();
  const { customer } = await createCustomer(prisma, business.id, parsed.data);

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomerAction(
  customerId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = updateCustomerSchema.safeParse({
    ...formDataObject(formData),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return fieldErrorsFrom(parsed.error);
  }

  const business = await getSessionBusiness();
  try {
    await updateCustomer(prisma, business.id, customerId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function recordRepaymentAction(
  customerId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = repaymentSchema.safeParse(formDataObject(formData));
  if (!parsed.success) {
    return fieldErrorsFrom(parsed.error);
  }

  const business = await getSessionBusiness();
  try {
    await recordRepayment(prisma, business.id, customerId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function recordAdjustmentAction(
  customerId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = adjustmentSchema.safeParse(formDataObject(formData));
  if (!parsed.success) {
    return fieldErrorsFrom(parsed.error);
  }

  const business = await getSessionBusiness();
  try {
    await recordAdjustment(prisma, business.id, customerId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}
