import { expect } from "chai";
import { getUnitKind, getUnitLabel, getUnitStep, getUnitPerPriceLabel } from "../lib/domain/units";

describe("units domain", () => {
  describe("getUnitKind", () => {
    it("should return grams for unitId 1", () => {
      expect(getUnitKind(1)).to.equal("grams");
    });

    it("should return pieces for other unitIds", () => {
      expect(getUnitKind(2)).to.equal("pieces");
      expect(getUnitKind(undefined)).to.equal("pieces");
    });
  });

  describe("getUnitLabel", () => {
    it("should match getUnitKind", () => {
      expect(getUnitLabel(1)).to.equal("grams");
      expect(getUnitLabel(2)).to.equal("pieces");
    });
  });

  describe("getUnitStep", () => {
    it("should return 100 for grams", () => {
      expect(getUnitStep(1)).to.equal(100);
    });

    it("should return 1 for pieces", () => {
      expect(getUnitStep(2)).to.equal(1);
    });
  });

  describe("getUnitPerPriceLabel", () => {
    it("should return '100 grams' for grams", () => {
      expect(getUnitPerPriceLabel(1)).to.equal("100 grams");
    });

    it("should return 'piece' for pieces", () => {
      expect(getUnitPerPriceLabel(2)).to.equal("piece");
    });
  });
});
