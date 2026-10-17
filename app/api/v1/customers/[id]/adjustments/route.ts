import { NextResponse } from "next/server";
import { errorResponse, parseJson, statementEntryJson } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { recordAdjustment } from "@/lib/services/credit";
import { getSessionBusiness } from "@/lib/session";
import { adjustmentSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const business = await getSessionBusiness();
    const body = await parseJson(request, adjustmentSchema);
    const result = await recordAdjustment(prisma, business.id, id, body);

    return NextResponse.json(
      {
        entry: statementEntryJson(result.entry, business.currency),
        balance: formatMoney(result.balance, business.currency),
        replayed: result.replayed,
      },
      { status: result.replayed ? 200 : 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
