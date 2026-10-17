import Link from "next/link";
import { notFound } from "next/navigation";
import type { StatementEntryKind } from "@/app/generated/prisma/client";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/app/ui/field";
import { Money } from "@/app/ui/money";
import { BackLink, BottomBar, Page } from "@/app/ui/shell";
import { DomainError } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getCustomerDetail } from "@/lib/services/customer";
import { getSessionBusiness } from "@/lib/session";
import { formatDate } from "@/lib/time";

export const metadata = { title: "Customer" };
export const instant = false;

function describeEntry(
  kind: StatementEntryKind,
  reason: string | null,
): string {
  switch (kind) {
    case "SALE_ON_CREDIT":
      return "Credit sale";
    case "REPAYMENT":
      return "Payment received";
    case "VOID_REVERSAL":
      return "Voided sale";
    case "ADJUSTMENT":
      return reason ?? "Adjustment";
  }
}

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getSessionBusiness();

  let detail;
  try {
    detail = await getCustomerDetail(prisma, business.id, id);
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const { customer, balance } = detail;
  const currency = business.currency;
  const owes = balance.gt(0);
  const settled = balance.isZero();
  const stateLabel = owes ? "Owes you" : settled ? "Settled" : "Credit balance";
  const stateClass = owes
    ? "text-owed"
    : settled
      ? "text-ink/55"
      : "text-settled";

  return (
    <Page>
      <BackLink href="/customers">Customers</BackLink>

      <header className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-[24px] font-semibold tracking-tight">
            {customer.name}
          </h1>
          {customer.phone ? (
            <p className="mt-0.5 text-[14px] text-ink/60">{customer.phone}</p>
          ) : null}
        </div>
        <Link
          href={`/customers/${customer.id}/edit`}
          className={`${buttonSecondaryClass} h-9 shrink-0 px-3 text-[14px]`}
        >
          Edit
        </Link>
      </header>

      {customer.isActive ? null : (
        <p className="mt-4 rounded-md border border-rule bg-white px-3 py-2.5 text-[13px] text-ink/60">
          This customer is inactive. They stay in your records but won&apos;t
          appear when creating sales.
        </p>
      )}

      <section className="mt-8">
        <p className={`text-[13px] font-medium ${stateClass}`}>{stateLabel}</p>
        <p
          className={`mt-1 text-[40px] font-semibold leading-none tracking-tight ${stateClass}`}
        >
          <Money value={formatMoney(balance, currency)} />{" "}
          <span className="text-[15px] font-medium tracking-normal text-ink/50">
            {currency}
          </span>
        </p>
        <div className="mt-4 border-t-2 border-ink" />
        <div className="mt-1 border-t border-rule" />
      </section>

      <dl className="mt-6 space-y-2 text-[15px]">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ink/60">Total purchases</dt>
          <dd className="font-medium">
            <Money value={formatMoney(detail.totalPurchases, currency)} />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ink/60">Total paid</dt>
          <dd className="font-medium text-settled">
            <Money value={formatMoney(detail.totalPaid, currency)} />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ink/60">Last activity</dt>
          <dd>
            {detail.lastTransactionAt
              ? formatDate(detail.lastTransactionAt, business.timezone)
              : "—"}
          </dd>
        </div>
      </dl>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[15px] font-semibold">Statement</h2>
          <div className="text-right text-[12px] leading-4 text-ink/45">
            <div>Amount ({currency})</div>
            <div>Balance</div>
          </div>
        </div>

        {detail.statement.length === 0 ? (
          <p className="mt-4 text-[15px] text-ink/60">
            No entries yet. Add an opening balance if they already owe you.
          </p>
        ) : (
          <ul className="mt-2 border-t border-rule">
            {detail.statement.map((entry) => {
              const negative = entry.amount.isNegative();
              return (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-4 border-b border-rule py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-medium">
                      {describeEntry(entry.kind, entry.reason)}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink/50">
                      {formatDate(entry.occurredAt, business.timezone)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`text-[15px] font-medium ${
                        negative ? "text-settled" : ""
                      }`}
                    >
                      <Money
                        value={formatMoney(entry.amount, currency)}
                        showSign
                      />
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink/50">
                      <Money
                        value={formatMoney(entry.balanceAfter, currency)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <BottomBar>
        <Link
          href={`/customers/${customer.id}/pay`}
          className={`${buttonPrimaryClass} flex-1`}
        >
          Record payment
        </Link>
        <Link
          href={`/customers/${customer.id}/adjust`}
          className={`${buttonSecondaryClass} flex-1`}
        >
          Adjust balance
        </Link>
      </BottomBar>
    </Page>
  );
}
