import { expect } from "chai";
import { formatCurrency } from "../lib/formatCurrency";

describe("formatCurrency", () => {
  it("should format positive numbers with thousands separators", () => {
    const formatted = formatCurrency(1000);
    expect(formatted).to.equal("1.000");
  });

  it("should format large numbers correctly", () => {
    const formatted = formatCurrency(1500000);
    expect(formatted).to.equal("1.500.000");
  });

  it("should format zero correctly", () => {
    const formatted = formatCurrency(0);
    expect(formatted).to.equal("0");
  });
});
