"use client";

import { useActionState, useRef } from "react";
import { ErrorBanner } from "@/app/ui/banner";
import {
  buttonSecondaryClass,
  Field,
  inputClass,
} from "@/app/ui/field";
import { BottomBar } from "@/app/ui/shell";
import { SubmitButton } from "@/app/ui/submit";
import type { FormState } from "@/app/customers/form-state";

const METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "BANK", label: "Bank" },
] as const;

const methodChipClass =
  "flex-1 cursor-pointer rounded-md border border-rule bg-white px-2 py-2.5 text-center text-[14px] font-medium text-ink/70 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink";

export function PaymentForm({
  action,
  balance,
  currency,
  requestKey,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  balance: string;
  currency: string;
  requestKey: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const amountRef = useRef<HTMLInputElement>(null);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state?.error ? <ErrorBanner>{state.error}</ErrorBanner> : null}

      <Field
        label={`Amount (${currency})`}
        htmlFor="amount"
        error={errors?.amount}
        hint="Take the exact amount received."
      >
        <div className="flex gap-2">
          <input
            ref={amountRef}
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            className={inputClass}
            required
          />
          <button
            type="button"
            onClick={() => {
              if (amountRef.current) {
                amountRef.current.value = balance;
                amountRef.current.focus();
              }
            }}
            className={`${buttonSecondaryClass} shrink-0 px-3 text-[14px]`}
          >
            Full balance
          </button>
        </div>
      </Field>

      <fieldset className="space-y-1.5">
        <legend className="text-[13px] font-medium text-ink/70">
          Method
        </legend>
        <div className="flex gap-2">
          {METHODS.map((method) => (
            <label key={method.value} className={methodChipClass}>
              <input
                type="radio"
                name="method"
                value={method.value}
                defaultChecked={method.value === "CASH"}
                className="sr-only"
              />
              {method.label}
            </label>
          ))}
        </div>
        {errors?.method ? (
          <p className="text-[13px] text-danger">{errors.method}</p>
        ) : null}
      </fieldset>

      <Field
        label="Reference (optional)"
        htmlFor="reference"
        error={errors?.reference}
      >
        <input
          id="reference"
          name="reference"
          autoComplete="off"
          placeholder="e.g. EVC receipt number"
          className={inputClass}
        />
      </Field>

      <Field label="Note (optional)" htmlFor="note" error={errors?.note}>
        <input id="note" name="note" autoComplete="off" className={inputClass} />
      </Field>

      <input type="hidden" name="requestKey" value={requestKey} />

      <BottomBar>
        <SubmitButton pendingLabel="Recording…">Record payment</SubmitButton>
      </BottomBar>
    </form>
  );
}
