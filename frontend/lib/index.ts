// Migration note:
// Delete the local `@/data/*` imports inside `frontend/lib/domain/*` when the backend API is ready.
// Replace those lookups with `fetch('/api/...')` helpers in `frontend/fetch/*`.
// Frontend never calls DAO directly; DAO stays backend-only behind the API layer.
// Keep these exported function names stable so components do not need to change.
export { formatCurrency } from "./formatCurrency";
export {
  createTenantProductDraft,
  deleteTenantProductDraft,
  buildTenantProductSavePayload,
  createEmptyProductDraft,
  createProductDraftFromRow,
  hasApprovedCategory,
  readImageFileAsDataUrl,
  saveTenantProductDraft,
  updateTenantProductDraft,
  type TenantProductSavePayload,
} from "./editor/tenant-product";
export { buildBasketSavePayload, saveBasketItemDraft, type BasketSavePayload } from "./editor/basket";
export {
  addBasketItem,
  clearBasketItems,
  getBasketItems,
  removeBasketItem,
  removeBasketTenantItems,
  type BasketItem,
} from "./editor/basket";
export { getTenantById, getTenantByName, getTenants } from "./domain/tenants";
export { getAdmins, getAdminCategories, saveAdminCategories, getTaxRate, saveTaxRate, resetTaxRate } from "./domain/admins";
export { getCustomers, getCustomerShippingAddressById } from "./domain/customers";
export { getUserByRoleAndId, saveUserProfileDraft, type EditableUserRow, type UserLookupRole } from "./domain/users";
export { getUnitById, getUnitLabel, getUnits } from "./domain/units";
export {
  getProductTenantName,
  getTenantProductById,
  getTenantProducts,
  toCatalogCard,
  toProductDetails,
  toTenantDashboardCard,
} from "./domain/tenant-products";
export {
  getPurchaseOrders,
  purchaseOrderRows,
  calculateOrderTotal,
  getStatusLabel,
  getStatusBadgeClass,
  isAcceptedOrderStatus,
  formatOrderDate,
} from "./domain/purchase-orders";
export {
  CHECKOUT_PAYMENT_METHODS,
  getCheckoutPaymentInstructions,
  getCheckoutSubtotal,
  resolveSavedShippingAddress,
  type AddressMode,
  type PaymentMethod,
  type CheckoutPaymentMethodOption,
} from "./domain/checkout";
export { resolvePageHeaderAction, resolvePageHeaderTitle, shouldHidePageHeader } from "./navigation/page-header";
export { searchProductsAndCategories, filterProductsBySearch, type SearchResult } from "./search";
export {
  COOKIE_KEYS,
  normalizeRoleValue,
  mapAppRoleToUserRole,
  readCookieLatest,
  writeCookie,
  clearCookie,
  readAuthSessionFromCookies,
  writeAuthCookies,
  clearAuthCookies,
  type AppRole,
  type UserRole,
} from "./cookies";
export type { TenantProductCard, TenantProductDetails } from "./domain/tenant-products";
export type { PurchaseOrder, POItem } from "./domain/purchase-orders";