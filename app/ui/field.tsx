import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-ink/70"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-[13px] text-ink/50">{hint}</p>
      ) : null}
      {error ? <p className="text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}

export const inputClass =
  "block w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[16px] text-ink placeholder:text-ink/35";

export const buttonPrimaryClass =
  "inline-flex h-11 items-center justify-center rounded-md bg-ink px-4 text-[15px] font-medium text-paper hover:bg-ink/90 disabled:opacity-60";

export const buttonSecondaryClass =
  "inline-flex h-11 items-center justify-center rounded-md border border-rule bg-white px-4 text-[15px] font-medium text-ink hover:bg-ink/[0.04]";
