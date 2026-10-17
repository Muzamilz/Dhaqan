import { notFound } from "next/navigation";
import { Money } from "@/app/ui/money";
import { BackLink, Page } from "@/app/ui/shell";
import { DomainError } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getCustomerDetail } from "@/lib/services/customer";
import { getSessionBusiness } from "@/lib/session";
import { recordAdjustmentAction } from "../../actions";
import { AdjustmentForm } from "../adjustment-form";

export const metadata = { title: "Adjust balance" };
export const instant = false;

export default async function AdjustPage({
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
  const action = recordAdjustmentAction.bind(null, detail.customer.id);
  const writeOffBalance = balance.gt(0)
    ? formatMoney(balance, business.currency)
    : "0.00";

  return (
    <Page>
      <BackLink href={`/customers/${id}`}>{detail.customer.name}</BackLink>
      <h1 className="mt-3 text-[22px] font-semibold tracking-tight">
        Adjust balance
      </h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Use this for opening balances and corrections. Current balance:{" "}
        <Money
          value={formatMoney(balance, business.currency)}
          className="font-medium"
        />{" "}
        {business.currency}.
      </p>
      <AdjustmentForm
        action={action}
        balance={writeOffBalance}
        currency={business.currency}
        requestKey={crypto.randomUUID()}
      />
    </Page>
  );
}
