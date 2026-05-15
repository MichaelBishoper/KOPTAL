// Data loading (async — call these in useEffect / server components to populate module caches).
export { loadTenants } from "./domain/tenants";
export { loadUnits } from "./domain/units";
export { loadTenantProducts } from "./domain/tenant-products";
export { loadCustomers } from "./domain/customers";
export { loadPurchaseOrders } from "./domain/purchase-orders";
export { loadAdminSettings } from "./domain/admins";
export { formatCurrency } from "./formatCurrency";
export {
  deleteTenantProductDraft,
  buildTenantProductSavePayload,
  createEmptyProductDraft,
  createProductDraftFromRow,
  hasApprovedCategory,
  readImageFileAsDataUrl,
  saveTenantProductDraft,
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
export { getAdminCategories, saveAdminCategories, getTaxRate, saveTaxRate, resetTaxRate } from "./domain/admins";
export { getCustomers, getCustomerShippingAddressById } from "./domain/customers";
export { getUserByRoleAndId, saveUserProfileDraft, type EditableUserRow, type UserLookupRole } from "./domain/users";
export { getUnitById, getUnitLabel, getUnits } from "./domain/units";
export {
  getProductTenantName,
  getTenantProductById,
  getTenantProducts,
  loadTenantProductById,
  loadTenantProductById as getTenantProductForEditor,
  toCatalogCard,
  toProductDetails,
  toTenantDashboardCard,
  type TenantProductCard,
  type TenantProductDetails,
} from "./domain/tenant-products";
export {
  getPurchaseOrders,
  purchaseOrderRows,
  calculateOrderTotal,
  getStatusLabel,
  getStatusBadgeClass,
  isAcceptedOrderStatus,
  formatOrderDate,
  type POItem,
  type PurchaseOrder,
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
  readAuthSessionFromCookies,
  type AppRole,
  type UserRole,
} from "./cookies";