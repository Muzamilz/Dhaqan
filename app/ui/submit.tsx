"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonPrimaryClass } from "./field";

export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? `${buttonPrimaryClass} w-full`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
