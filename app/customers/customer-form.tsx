"use client";

import { useActionState } from "react";
import { ErrorBanner } from "@/app/ui/banner";
import { Field, inputClass } from "@/app/ui/field";
import { BottomBar } from "@/app/ui/shell";
import { SubmitButton } from "@/app/ui/submit";
import type { FormState } from "./form-state";

export type CustomerInitial = {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  creditLimit: string | null;
  isActive: boolean;
};

export function CustomerForm({
  action,
  currency,
  initial,
  showActive = false,
  submitLabel,
  pendingLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  currency: string;
  initial?: CustomerInitial;
  showActive?: boolean;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state?.error ? <ErrorBanner>{state.error}</ErrorBanner> : null}

      <Field label="Name" htmlFor="name" error={errors?.name}>
        <input
          id="name"
          name="name"
          defaultValue={initial?.name ?? ""}
          autoComplete="off"
          className={inputClass}
          required
        />
      </Field>

      <Field label="Phone (optional)" htmlFor="phone" error={errors?.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initial?.phone ?? ""}
          autoComplete="off"
          className={inputClass}
        />
      </Field>

      <Field
        label={`Credit limit (${currency}, optional)`}
        htmlFor="creditLimit"
        error={errors?.creditLimit}
        hint="A warning only. Sales above it are flagged."
      >
        <input
          id="creditLimit"
          name="creditLimit"
          inputMode="decimal"
          defaultValue={initial?.creditLimit ?? ""}
          autoComplete="off"
          placeholder="0.00"
          className={inputClass}
        />
      </Field>

      <Field label="Notes (optional)" htmlFor="notes" error={errors?.notes}>
        <textarea
          id="notes"
          name="notes"
          defaultValue={initial?.notes ?? ""}
          rows={3}
          className={inputClass}
        />
      </Field>

      {showActive ? (
        <div className="flex items-center gap-2.5">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={initial?.isActive ?? true}
            className="size-4 accent-[color:var(--color-ink)]"
          />
          <label htmlFor="isActive" className="text-[14px] text-ink/80">
            Active. Inactive customers stay in your records but won&apos;t
            appear when creating sales.
          </label>
        </div>
      ) : null}

      <BottomBar>
        <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
      </BottomBar>
    </form>
  );
}
