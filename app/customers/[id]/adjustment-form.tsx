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

export function AdjustmentForm({
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
        hint="Add with a plain amount, write off with a minus. For example −10.00."
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
                amountRef.current.value = `-${balance}`;
                amountRef.current.focus();
              }
            }}
            className={`${buttonSecondaryClass} shrink-0 px-3 text-[14px]`}
          >
            Write off balance
          </button>
        </div>
      </Field>

      <Field
        label="Reason"
        htmlFor="reason"
        error={errors?.reason}
        hint="Saved on the statement. For example “Opening balance”."
      >
        <input
          id="reason"
          name="reason"
          autoComplete="off"
          placeholder="Opening balance"
          className={inputClass}
          required
        />
      </Field>

      <input type="hidden" name="requestKey" value={requestKey} />

      <BottomBar>
        <SubmitButton pendingLabel="Saving…">Save adjustment</SubmitButton>
      </BottomBar>
    </form>
  );
}
