import { NextResponse } from "next/server";
import {
  customerJson,
  errorResponse,
  parseJson,
  statementEntryJson,
} from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import {
  getCustomerDetail,
  updateCustomer,
} from "@/lib/services/customer";
import { getSessionBusiness } from "@/lib/session";
import { updateCustomerSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const business = await getSessionBusiness();
    const detail = await getCustomerDetail(prisma, business.id, id);

    return NextResponse.json({
      currency: business.currency,
      customer: customerJson(
        detail.customer,
        business.currency,
        detail.balance,
      ),
      summary: {
        totalPurchases: formatMoney(
          detail.totalPurchases,
          business.currency,
        ),
        totalPaid: formatMoney(detail.totalPaid, business.currency),
        lastTransactionAt: detail.lastTransactionAt,
      },
      statement: detail.statement.map((entry) =>
        statementEntryJson(entry, business.currency),
      ),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const business = await getSessionBusiness();
    const body = await parseJson(request, updateCustomerSchema);
    const customer = await updateCustomer(prisma, business.id, id, body);

    return NextResponse.json({
      customer: customerJson(customer, business.currency),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
