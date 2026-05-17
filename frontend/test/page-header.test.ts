import { expect } from "chai";
import { resolvePageHeaderTitle, resolvePageHeaderAction, shouldHidePageHeader } from "../lib/navigation/page-header";

describe("page-header", () => {
  describe("resolvePageHeaderTitle", () => {
    it("should return predefined title for exact matches", () => {
      expect(resolvePageHeaderTitle("/admin/a_dashboard")).to.equal("Admin Dashboard");
      expect(resolvePageHeaderTitle("/customer/basket")).to.equal("Basket");
    });

    it("should return Product Details for product routes", () => {
      expect(resolvePageHeaderTitle("/customer/product/123")).to.equal("Product Details");
    });

    it("should format unknown paths by splitting and capitalizing", () => {
      expect(resolvePageHeaderTitle("/some/custom_path")).to.equal("Some Custom path");
    });

    it("should return empty string for empty path", () => {
      expect(resolvePageHeaderTitle("/")).to.equal("");
    });
  });

  describe("resolvePageHeaderAction", () => {
    it("should return customer marketplace action for customer paths", () => {
      expect(resolvePageHeaderAction("/customer/basket")).to.deep.equal({
        label: "Continue shopping",
        href: "/customer/marketplace",
      });
    });

    it("should return null for customer marketplace path itself", () => {
      expect(resolvePageHeaderAction("/customer/marketplace")).to.be.null;
    });

    it("should return tenant dashboard action for tenant paths", () => {
      expect(resolvePageHeaderAction("/tennant/product_add")).to.deep.equal({
        label: "Back to dashboard",
        href: "/tennant/t_dashboard",
      });
    });

    it("should return null for tenant dashboard path itself", () => {
      expect(resolvePageHeaderAction("/tennant/t_dashboard")).to.be.null;
    });

    it("should return null for unrecognized paths", () => {
      expect(resolvePageHeaderAction("/unknown")).to.be.null;
    });
  });

  describe("shouldHidePageHeader", () => {
    it("should hide header for home, root, admin, and user paths", () => {
      expect(shouldHidePageHeader("/")).to.be.true;
      expect(shouldHidePageHeader("/home")).to.be.true;
      expect(shouldHidePageHeader("/admin/a_dashboard")).to.be.true;
      expect(shouldHidePageHeader("/system/user")).to.be.true;
    });

    it("should show header for other paths", () => {
      expect(shouldHidePageHeader("/customer/basket")).to.be.false;
      expect(shouldHidePageHeader("/tennant/t_dashboard")).to.be.false;
    });
  });
});
