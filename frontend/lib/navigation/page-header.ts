export const PAGE_TITLES: Record<string, string> = {
  "/admin/a_dashboard": "Admin Dashboard",
  "/customer/basket": "Basket",
  "/customer/c_transaction": "Transactions",
  "/customer/marketplace": "Marketplace",
  "/customer/product": "Product Details",
  "/customer/tennant": "Tenant",
  "/system/transaction-details": "Transaction Details",
  "/system/user": "User",
  "/home": "Home",
  "/tennant/product_add": "Add Product",
  "/tennant/product": "Products",
  "/tennant/t_dashboard": "Tenant Dashboard",
  "/tennant/t_transaction": "Transactions",
  "/tennant": "Tenant",
};

export function resolvePageHeaderTitle(pathname: string): string {
  if (pathname.startsWith("/customer/product/")) return "Product Details";

  const exactTitle = PAGE_TITLES[pathname];
  if (exactTitle) return exactTitle;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "";

  return segments
    .map((segment) => segment.replace(/[-_]/g, " "))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function resolvePageHeaderAction(pathname: string): { label: string; href: string } | null {
  if (pathname.startsWith("/customer")) {
    if (pathname === "/customer/marketplace") return null;
    return { label: "Continue shopping", href: "/customer/marketplace" };
  }

  if (pathname.startsWith("/tennant")) {
    if (pathname === "/tennant/t_dashboard") return null;
    return { label: "Back to dashboard", href: "/tennant/t_dashboard" };
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/a_dashboard") return null;
    return { label: "Back to dashboard", href: "/admin/a_dashboard" };
  }

  return null;
}

export function shouldHidePageHeader(pathname: string): boolean {
  return pathname === "/" || pathname === "/home" || pathname.startsWith("/admin") || pathname === "/system/user";
}
