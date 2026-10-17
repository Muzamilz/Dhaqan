import type { ReactNode } from "react";

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-danger/30 bg-danger/[0.06] px-3 py-2.5 text-[14px] text-danger"
    >
      {children}
    </p>
  );
}
