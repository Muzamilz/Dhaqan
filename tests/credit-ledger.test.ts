import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestPrisma, truncateAllTables } from "./helpers/db";
import {
  createCustomer,
  getCustomerDetail,
  listCustomers,
  updateCustomer,
} from "@/lib/services/customer";
import { recordAdjustment, recordRepayment } from "@/lib/services/credit";

const prisma = createTestPrisma();

async function setup(currency = "USD") {
  const business = await prisma.business.create({
    data: { name: "Test shop", currency },
  });
  const { customer } = await createCustomer(prisma, business.id, {
    name: "Ayaan",
  });
  return { business, customer };
}

beforeEach(async () => {
  await truncateAllTables(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("customer credit ledger", () => {
  it("balance is the sum of statement entries (BR-12)", async () => {
    const { business, customer } = await setup();

    await recordAdjustment(prisma, business.id, customer.id, {
      amount: "60.00",
      reason: "Opening balance",
    });
    await recordRepayment(prisma, business.id, customer.id, {
      amount: "20.00",
      method: "CASH",
      requestKey: "r1",
    });

    const detail = await getCustomerDetail(prisma, business.id, customer.id);
    expect(detail.balance.toFixed(2)).toBe("40.00");
  });

  it("refuses a repayment above the balance and names the owed amount (BR-13, CUST-04)", async () => {
    const { business, customer } = await setup();

    await recordAdjustment(prisma, business.id, customer.id, {
      amount: "60.00",
      reason: "Opening balance",
    });

    await expect(
      recordRepayment(prisma, business.id, customer.id, {
        amount: "75.00",
        method: "CASH",
        requestKey: "r2",
      }),
    ).rejects.toThrow("Ayaan owes 60.00. Enter 60.00 or less.");

    const detail = await getCustomerDetail(prisma, business.id, customer.id);
    expect(detail.balance.toFixed(2)).toBe("60.00");
  });

  it("accepts a repayment equal to the balance", async () => {
    const { business, customer } = await setup();

    await recordAdjustment(prisma, business.id, customer.id, {
      amount: "60.00",
      reason: "Opening balance",
    });
    const result = await recordRepayment(prisma, business.id, customer.id, {
      amount: "60.00",
      method: "CASH",
      requestKey: "r3",
    });

    expect(result.balance.toFixed(2)).toBe("0.00");
  });

  it("replays an idempotent repayment instead of double-charging (BR-22)", async () => {
    const { business, customer } = await setup();

    await recordAdjustment(prisma, business.id, customer.id, {
      amount: "100.00",
      reason: "Opening balance",
    });
    const first = await recordRepayment(prisma, business.id, customer.id, {
      amount: "30.00",
      method: "CASH",
      requestKey: "same-key",
    });
    const second = await recordRepayment(prisma, business.id, customer.id, {
      amount: "30.00",
      method: "CASH",
      requestKey: "same-key",
    });

    expect(second.replayed).toBe(true);
    expect(second.payment.id).toBe(first.payment.id);
    expect(second.balance.toFixed(2)).toBe("70.00");
    expect(
      await prisma.payment.count({ where: { businessId: business.id } }),
    ).toBe(1);
    expect(
      await prisma.customerStatementEntry.count({
        where: { businessId: business.id, kind: "REPAYMENT" },
      }),
    ).toBe(1);
  });

  it("serializes concurrent repayments so the balance cannot go negative (BR-13)", async () => {
    const { business, customer } = await setup();

    await recordAdjustment(prisma, business.id, customer.id, {
      amount: "100.00",
      reason: "Opening balance",
    });

    const results = await Promise.allSettled([
      recordRepayment(prisma, business.id, customer.id, {
        amount: "60.00",
        method: "CASH",
        requestKey: "c1",
      }),
      recordRepayment(prisma, business.id, customer.id, {
        amount: "60.00",
        method: "CASH",
        requestKey: "c2",
      }),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const detail = await getCustomerDetail(prisma, business.id, customer.id);
    expect(detail.balance.toFixed(2)).toBe("40.00");
  });

  it("keeps tenants isolated (AS-11)", async () => {
    const tenantA = await setup();
    const tenantB = await setup();

    await expect(
      recordRepayment(prisma, tenantB.business.id, tenantA.customer.id, {
        amount: "1.00",
        method: "CASH",
        requestKey: "x1",
      }),
    ).rejects.toThrow("Customer not found");

    await expect(
      getCustomerDetail(prisma, tenantB.business.id, tenantA.customer.id),
    ).rejects.toThrow("Customer not found");
  });

  it("allows adjustments that make the balance negative (write-offs)", async () => {
    const { business, customer } = await setup();

    await recordAdjustment(prisma, business.id, customer.id, {
      amount: "40.00",
      reason: "Opening balance",
    });
    await recordAdjustment(prisma, business.id, customer.id, {
      amount: "-50.00",
      reason: "Write-off: moved away",
    });

    const detail = await getCustomerDetail(prisma, business.id, customer.id);
    expect(detail.balance.toFixed(2)).toBe("-10.00");
  });

  it("tracks statement running balances, totals, and last activity", async () => {
    const { business, customer } = await setup();

    await recordAdjustment(prisma, business.id, customer.id, {
      amount: "100.00",
      reason: "Opening balance",
    });
    await recordRepayment(prisma, business.id, customer.id, {
      amount: "30.00",
      method: "CASH",
      requestKey: "s1",
    });

    const detail = await getCustomerDetail(prisma, business.id, customer.id);

    expect(detail.statement).toHaveLength(2);
    expect(detail.statement[0].kind).toBe("REPAYMENT");
    expect(detail.statement[0].balanceAfter.toFixed(2)).toBe("70.00");
    expect(detail.statement[1].balanceAfter.toFixed(2)).toBe("100.00");
    expect(detail.totalPurchases.toFixed(2)).toBe("0.00");
    expect(detail.totalPaid.toFixed(2)).toBe("30.00");
    expect(detail.lastTransactionAt).not.toBeNull();
  });

  it("lists customers with balances, text search, and the owes filter", async () => {
    const { business } = await setup();
    const { customer: bashiir } = await createCustomer(prisma, business.id, {
      name: "Bashiir",
      phone: "0612345678",
    });
    await recordAdjustment(prisma, business.id, bashiir.id, {
      amount: "25.00",
      reason: "Opening balance",
    });

    const all = await listCustomers(prisma, business.id, { limit: 50 });
    expect(all.map((customer) => customer.name)).toEqual([
      "Ayaan",
      "Bashiir",
    ]);

    const owesOnly = await listCustomers(prisma, business.id, {
      owes: true,
      limit: 50,
    });
    expect(owesOnly.map((customer) => customer.name)).toEqual(["Bashiir"]);

    const search = await listCustomers(prisma, business.id, {
      q: "0612",
      limit: 50,
    });
    expect(search.map((customer) => customer.name)).toEqual(["Bashiir"]);
  });

  it("warns about duplicate phone numbers without blocking (CUST-01)", async () => {
    const { business, customer } = await setup();
    await updateCustomer(prisma, business.id, customer.id, {
      phone: "0611111111",
    });

    const { warnings } = await createCustomer(prisma, business.id, {
      name: "Deeq",
      phone: "0611111111",
    });

    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("DUPLICATE_PHONE");
  });

  it("deactivates instead of deleting (CUST-08)", async () => {
    const { business, customer } = await setup();

    await updateCustomer(prisma, business.id, customer.id, {
      isActive: false,
    });

    const detail = await getCustomerDetail(prisma, business.id, customer.id);
    expect(detail.customer.isActive).toBe(false);
  });

  it("rounds amounts to the smallest unit per currency (BR-02)", async () => {
    const usd = await setup("USD");
    await recordAdjustment(prisma, usd.business.id, usd.customer.id, {
      amount: "10.005",
      reason: "Rounding check",
    });
    const usdDetail = await getCustomerDetail(
      prisma,
      usd.business.id,
      usd.customer.id,
    );
    expect(usdDetail.balance.toFixed(2)).toBe("10.01");

    const sos = await setup("SOS");
    await recordAdjustment(prisma, sos.business.id, sos.customer.id, {
      amount: "1.5",
      reason: "Rounding check",
    });
    const sosDetail = await getCustomerDetail(
      prisma,
      sos.business.id,
      sos.customer.id,
    );
    expect(sosDetail.balance.toFixed(0)).toBe("2");
  });
});
