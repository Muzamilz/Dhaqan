import { notFound } from "next/navigation";
import { Money } from "@/app/ui/money";
import { BackLink, Page } from "@/app/ui/shell";
import { DomainError } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getCustomerDetail } from "@/lib/services/customer";
import { getSessionBusiness } from "@/lib/session";
import { recordRepaymentAction } from "../../actions";
import { PaymentForm } from "../payment-form";

export const metadata = { title: "Record payment" };
export const instant = false;

export default async function PayPage({
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

  const balance = detail.balance;
  const action = recordRepaymentAction.bind(null, detail.customer.id);

  return (
    <Page>
      <BackLink href={`/customers/${id}`}>{detail.customer.name}</BackLink>
      <h1 className="mt-3 text-[22px] font-semibold tracking-tight">
        Record payment
      </h1>
      <p className="mt-1 text-[14px] text-ink/60">
        {balance.gt(0) ? (
          <>
            {detail.customer.name} owes{" "}
            <Money
              value={formatMoney(balance, business.currency)}
              className="font-medium text-owed"
            />{" "}
            {business.currency}.
          </>
        ) : balance.isZero() ? (
          "The balance is settled."
        ) : (
          <>
            They have a credit of{" "}
            <Money
              value={formatMoney(balance.abs(), business.currency)}
              className="font-medium text-settled"
            />{" "}
            {business.currency}.
          </>
        )}
      </p>
      <PaymentForm
        action={action}
        balance={
          balance.gt(0) ? formatMoney(balance, business.currency) : "0.00"
        }
        currency={business.currency}
        requestKey={crypto.randomUUID()}
      />
    </Page>
  );
}
