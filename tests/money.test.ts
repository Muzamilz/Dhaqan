import { describe, expect, it } from "vitest";
import { formatMoney, minorUnitDigits, parseMoney } from "@/lib/money";

describe("money helpers", () => {
  it("rounds USD to cents, half up", () => {
    expect(formatMoney(parseMoney("10.005", "USD"), "USD")).toBe("10.01");
    expect(formatMoney(parseMoney("10.004", "USD"), "USD")).toBe("10.00");
  });

  it("rounds SOS to whole shillings, half up", () => {
    expect(formatMoney(parseMoney("1.4", "SOS"), "SOS")).toBe("1");
    expect(formatMoney(parseMoney("1.5", "SOS"), "SOS")).toBe("2");
  });

  it("rejects malformed amounts", () => {
    expect(() => parseMoney("abc", "USD")).toThrow();
  });

  it("defaults unknown currencies to two minor digits", () => {
    expect(minorUnitDigits("KES")).toBe(2);
  });
});
