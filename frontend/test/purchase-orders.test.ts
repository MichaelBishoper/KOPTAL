import { expect } from "chai";
import {
  getStatusBadgeClass,
  getStatusLabel,
  isAcceptedOrderStatus,
  formatOrderDate,
  calculateOrderTotal,
} from "../lib/domain/purchase-orders";
import * as admins from "../lib/domain/admins";

describe("purchase-orders domain", () => {
  describe("getStatusBadgeClass", () => {
    it("should return correct class for delivered", () => {
      expect(getStatusBadgeClass("delivered")).to.include("bg-emerald-100");
    });

    it("should return correct class for cancelled", () => {
      expect(getStatusBadgeClass("cancelled")).to.include("bg-rose-100");
    });

    it("should return correct class for ontheway", () => {
      expect(getStatusBadgeClass("ontheway")).to.include("bg-amber-100");
      expect(getStatusBadgeClass("shipped")).to.include("bg-amber-100");
    });

    it("should return correct class for pending states", () => {
      expect(getStatusBadgeClass("pending")).to.include("bg-sky-100");
      expect(getStatusBadgeClass("draft")).to.include("bg-sky-100");
      expect(getStatusBadgeClass("confirmed")).to.include("bg-sky-100");
    });

    it("should return fallback class for unknown status", () => {
      expect(getStatusBadgeClass("unknown")).to.include("bg-slate-100");
    });
  });

  describe("getStatusLabel", () => {
    it("should normalize status names", () => {
      expect(getStatusLabel("ontheway")).to.equal("On the way");
      expect(getStatusLabel("shipped")).to.equal("On the way");
      expect(getStatusLabel("pending")).to.equal("Pending");
      expect(getStatusLabel("draft")).to.equal("Pending");
      expect(getStatusLabel("confirmed")).to.equal("Accepted");
      expect(getStatusLabel("delivered")).to.equal("Delivered");
      expect(getStatusLabel("cancelled")).to.equal("Cancelled");
    });

    it("should return status as is if unknown", () => {
      expect(getStatusLabel("random_status")).to.equal("random_status");
    });
  });

  describe("isAcceptedOrderStatus", () => {
    it("should return true for accepted statuses", () => {
      expect(isAcceptedOrderStatus("ontheway")).to.be.true;
      expect(isAcceptedOrderStatus("shipped")).to.be.true;
      expect(isAcceptedOrderStatus("confirmed")).to.be.true;
      expect(isAcceptedOrderStatus("delivered")).to.be.true;
    });

    it("should return false for pending or cancelled statuses", () => {
      expect(isAcceptedOrderStatus("pending")).to.be.false;
      expect(isAcceptedOrderStatus("cancelled")).to.be.false;
      expect(isAcceptedOrderStatus("draft")).to.be.false;
    });
  });

  describe("formatOrderDate", () => {
    it("should format ISO string to en-GB locale string in UTC", () => {
      // 2024-01-15T10:30:00Z should format to 15/01/2024 in en-GB
      expect(formatOrderDate("2024-01-15T10:30:00Z")).to.include("15/01/2024");
    });
  });

  describe("calculateOrderTotal", () => {
    it("should calculate total using default tax rate (11%)", () => {
      // Subtotal: 100000, Tax: 11000, Total: 111000
      const result = calculateOrderTotal(100000);
      expect(result.tax).to.equal(11000);
      expect(result.total).to.equal(111000);
    });
  });
});
