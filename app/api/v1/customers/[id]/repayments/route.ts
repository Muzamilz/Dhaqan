import { NextResponse } from "next/server";
import { errorResponse, parseJson } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { recordRepayment } from "@/lib/services/credit";
import { getSessionBusiness } from "@/lib/session";
import { repaymentSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const business = await getSessionBusiness();
    const body = await parseJson(request, repaymentSchema);
    const result = await recordRepayment(prisma, business.id, id, body);

    return NextResponse.json(
      {
        payment: {
          id: result.payment.id,
          amount: formatMoney(result.payment.amount, business.currency),
          method: result.payment.method,
          reference: result.payment.reference,
          occurredAt: result.payment.occurredAt,
        },
        balance: formatMoney(result.balance, business.currency),
        replayed: result.replayed,
      },
      { status: result.replayed ? 200 : 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
