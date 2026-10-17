import type { ReactNode } from "react";
import Link from "next/link";

export function Page({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[560px] px-4 pt-6 pb-32">
      {children}
    </main>
  );
}

export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[560px] gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-block max-w-full truncate text-[14px] font-medium text-ink/60 hover:text-ink"
    >
      ← {children}
    </Link>
  );
}
