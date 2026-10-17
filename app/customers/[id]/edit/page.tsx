import { notFound } from "next/navigation";
import { BackLink, Page } from "@/app/ui/shell";
import { DomainError } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/services/customer";
import { getSessionBusiness } from "@/lib/session";
import { updateCustomerAction } from "../../actions";
import { CustomerForm } from "../../customer-form";

export const metadata = { title: "Edit customer" };
export const instant = false;

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getSessionBusiness();

  let customer;
  try {
    customer = await getCustomer(prisma, business.id, id);
  } catch (error) {
    if (error instanceof DomainError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const action = updateCustomerAction.bind(null, customer.id);

  return (
    <Page>
      <BackLink href={`/customers/${id}`}>{customer.name}</BackLink>
      <h1 className="mt-3 text-[22px] font-semibold tracking-tight">
        Edit customer
      </h1>
      <CustomerForm
        action={action}
        currency={business.currency}
        initial={{
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          notes: customer.notes,
          creditLimit: customer.creditLimit
            ? formatMoney(customer.creditLimit, business.currency)
            : null,
          isActive: customer.isActive,
        }}
        showActive
        submitLabel="Save changes"
        pendingLabel="Saving…"
      />
    </Page>
  );
}
