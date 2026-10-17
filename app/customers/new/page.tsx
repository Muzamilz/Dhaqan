import { getSessionBusiness } from "@/lib/session";
import { BackLink, Page } from "@/app/ui/shell";
import { createCustomerAction } from "../actions";
import { CustomerForm } from "../customer-form";

export const metadata = { title: "Add customer" };
export const instant = false;

export default async function NewCustomerPage() {
  const business = await getSessionBusiness();

  return (
    <Page>
      <BackLink href="/customers">Customers</BackLink>
      <h1 className="mt-3 text-[22px] font-semibold tracking-tight">
        Add customer
      </h1>
      <CustomerForm
        action={createCustomerAction}
        currency={business.currency}
        submitLabel="Add customer"
        pendingLabel="Adding…"
      />
    </Page>
  );
}
