import { NextResponse } from "next/server";
import { customerJson, errorResponse, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  createCustomer,
  listCustomers,
} from "@/lib/services/customer";
import { getSessionBusiness } from "@/lib/session";
import {
  createCustomerSchema,
  listCustomersQuerySchema,
} from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const business = await getSessionBusiness();
    const { searchParams } = new URL(request.url);
    const query = listCustomersQuerySchema.parse(
      Object.fromEntries(searchParams),
    );

    const customers = await listCustomers(prisma, business.id, {
      q: query.q,
      owes: Boolean(query.owes),
      limit: query.limit,
    });

    return NextResponse.json({
      currency: business.currency,
      customers: customers.map((customer) =>
        customerJson(customer, business.currency, customer.balance),
      ),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const business = await getSessionBusiness();
    const body = await parseJson(request, createCustomerSchema);
    const { customer, warnings } = await createCustomer(
      prisma,
      business.id,
      body,
    );

    return NextResponse.json(
      {
        customer: customerJson(customer, business.currency),
        warnings,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
