import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { listCustomers } from "@/lib/services/customer";
import { getSessionBusiness } from "@/lib/session";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
} from "@/app/ui/field";
import { Money } from "@/app/ui/money";
import { Page } from "@/app/ui/shell";

export const metadata = { title: "Customers" };
export const instant = false;

function tabClass(active: boolean): string {
  return active
    ? "flex-1 rounded-[4px] bg-white px-3 py-1.5 text-center text-ink shadow-sm"
    : "flex-1 rounded-[4px] px-3 py-1.5 text-center text-ink/60 hover:text-ink";
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" && params.q.trim() !== ""
    ? params.q.trim()
    : undefined;
  const owesOnly = params.owes === "1" || params.owes === "true";

  const business = await getSessionBusiness();
  const customers = await listCustomers(prisma, business.id, {
    q,
    owes: owesOnly,
    limit: 200,
  });
  const rows = owesOnly
    ? customers.toSorted((a, b) => b.balance.comparedTo(a.balance))
    : customers;

  const qSuffix = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <Page>
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Customers
        </h1>
        <Link href="/customers/new" className={buttonPrimaryClass}>
          Add customer
        </Link>
      </header>

      <form action="/customers" method="get" className="mt-5 flex gap-2">
        {owesOnly ? <input type="hidden" name="owes" value="1" /> : null}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name or phone"
          aria-label="Search customers"
          className={inputClass}
        />
        <button type="submit" className={`${buttonSecondaryClass} shrink-0`}>
          Search
        </button>
      </form>

      <nav className="mt-3 flex gap-1 rounded-md bg-ink/[0.05] p-1 text-[14px] font-medium">
        <Link
          href={q ? `/customers?q=${encodeURIComponent(q)}` : "/customers"}
          className={tabClass(!owesOnly)}
          scroll={false}
        >
          All
        </Link>
        <Link
          href={`/customers?owes=1${qSuffix}`}
          className={tabClass(owesOnly)}
          scroll={false}
        >
          Owing
        </Link>
      </nav>

      {rows.length === 0 ? (
        q ? (
          <p className="mt-8 text-[15px] text-ink/60">
            No matches for “{q}”. Check the spelling, or{" "}
            <Link href="/customers/new" className="underline">
              add a new customer
            </Link>
            .
          </p>
        ) : owesOnly ? (
          <p className="mt-8 text-[15px] text-ink/60">
            Nobody owes you right now.
          </p>
        ) : (
          <div className="mt-8">
            <p className="text-[15px] text-ink/60">
              No customers yet. Add a customer to start your credit book.
            </p>
            <Link
              href="/customers/new"
              className={`${buttonPrimaryClass} mt-4`}
            >
              Add customer
            </Link>
          </div>
        )
      ) : (
        <div className="mt-5">
          <div className="flex justify-end text-[13px] text-ink/50">
            <span>Balance ({business.currency})</span>
          </div>
          <ul className="mt-1 border-t border-rule">
            {rows.map((customer) => {
              const balance = customer.balance;
              const owes = balance.gt(0);
              return (
                <li key={customer.id} className="border-b border-rule">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 hover:bg-ink/[0.02]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[16px] font-medium">
                        {customer.name}
                      </span>
                      {customer.phone || !customer.isActive ? (
                        <span className="mt-0.5 flex items-center gap-2 text-[13px] text-ink/50">
                          {customer.phone ? (
                            <span className="truncate">{customer.phone}</span>
                          ) : null}
                          {customer.isActive ? null : (
                            <span className="rounded-sm border border-rule px-1.5 py-0.5 text-[11px]">
                              Inactive
                            </span>
                          )}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`shrink-0 text-[16px] font-medium ${
                        owes
                          ? "text-owed"
                          : balance.isZero()
                            ? "text-ink/50"
                            : "text-settled"
                      }`}
                    >
                      <Money value={formatMoney(balance, business.currency)} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Page>
  );
}
