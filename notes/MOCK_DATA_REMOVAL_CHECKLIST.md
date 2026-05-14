# Mock Data Removal Checklist

Use this when replacing `frontend/data/*` with backend API calls.

## Delete Only After Rewiring

Delete these mock sources only after no frontend code imports them anymore:

1. `frontend/data/admins.ts`
2. `frontend/data/customers.ts`
3. `frontend/data/tenants.ts`
4. `frontend/data/tenant-products.ts`
5. `frontend/data/units.ts`
6. `frontend/data/po-line-items.ts`
7. `frontend/data/purchase-orders.ts`
8. `frontend/data/` folder

## Do Not Delete

Keep these files and change their internals instead:

1. `frontend/lib/domain/*.ts`
2. `frontend/lib/editor/*.ts`
3. `frontend/lib/index.ts`
4. `frontend/lib/search.ts`
5. `frontend/fetch/tenant-product.ts`

## Lib Files You Can Delete After Rewire Is Complete

Most `frontend/lib/*` files are not delete targets. They are the stable frontend seam and should stay.

Delete only these `lib` files if the stated condition is true:

1. `frontend/lib/domain/index.ts` if you keep `frontend/lib/index.ts` as the only public re-export surface and nothing imports `frontend/lib/domain/index.ts` anymore.

Do not delete these `lib` files after rewiring:

1. `frontend/lib/index.ts`
2. `frontend/lib/domain/admins.ts`
3. `frontend/lib/domain/customers.ts`
4. `frontend/lib/domain/tenants.ts`
5. `frontend/lib/domain/tenant-products.ts`
6. `frontend/lib/domain/units.ts`
7. `frontend/lib/domain/purchase-orders.ts`
8. `frontend/lib/domain/users.ts`
9. `frontend/lib/domain/checkout.ts`
10. `frontend/lib/editor/tenant-product.ts`
11. `frontend/lib/editor/basket.ts`
12. `frontend/lib/search.ts`
13. `frontend/lib/formatCurrency.ts`
14. `frontend/lib/cookies/*`
15. `frontend/lib/navigation/*`

## What Actually Needs Rewiring

This is not only DAO or CRUD naming work.

You must update the frontend data flow in three places:

1. Replace mock imports in `frontend/lib/domain/*` with API client calls.
2. Convert synchronous mock-backed reads used during render into async-safe page or component flows.
3. Keep the public function names in `frontend/lib/index.ts` stable where possible.

## Safe Execution Order

1. Create or finish API client files under `frontend/fetch/`.
2. Rewire `frontend/lib/domain/*` away from `@/data/*`.
3. Rewire `frontend/lib/editor/*` functions that still fake persistence.
4. Update pages and components that currently call synchronous getters during render.
5. Confirm there are no matches for `@/data/`.
6. Delete `frontend/data/*`.
7. Run frontend validation.

## Per-File Checklist

### 1. Domain Files

#### `frontend/lib/domain/admins.ts`

Status now:
- Reads from `@/data/admins`.
- Uses localStorage for categories.
- Tax rate still falls back to mock default.

Required change:
- Replace mock admin read with API call.
- Decide whether categories remain cached client-side or come fully from backend.
- Decide whether tax rate remains client-derived or comes from backend settings.

Risk if skipped:
- Admin category search and tax display will still depend on mock state.

#### `frontend/lib/domain/customers.ts`

Status now:
- Reads from `@/data/customers`.

Required change:
- Replace with API lookup for customer rows or shipping address.

Risk if skipped:
- Purchase order and user profile flows will keep reading fake customer data.

#### `frontend/lib/domain/tenants.ts`

Status now:
- Reads from `@/data/tenants`.

Required change:
- Replace list and lookup helpers with backend-backed reads.

Risk if skipped:
- Product cards, tenant profile pages, and transaction details will keep using mock tenant identity data.

#### `frontend/lib/domain/tenant-products.ts`

Status now:
- Reads from `@/data/tenant-products`.
- Also supplies UI mapping helpers used throughout the app.

Required change:
- Replace raw data source with API reads.
- Keep mapping helpers like `toCatalogCard` and `toProductDetails` here.

Risk if skipped:
- Marketplace, product details, tenant dashboard, and search all break when mock data is removed.

#### `frontend/lib/domain/units.ts`

Status now:
- Reads from `@/data/units`.

Required change:
- Replace with API-backed unit lookup.

Risk if skipped:
- Product quantity labels and unit mapping will break or degrade to fallbacks.

#### `frontend/lib/domain/purchase-orders.ts`

Status now:
- Re-exports assembled purchase-order data directly from `@/data/purchase-orders`.

Required change:
- Rebuild the purchase-order shaping inside the domain layer.
- Join purchase orders, line items, customer data, tenant data, unit data, and product data from backend responses or from one backend endpoint that already returns the assembled shape.
- Keep exported names stable if possible.

Risk if skipped:
- Transaction history, tenant transactions, and PO detail screens lose their core data model.

### 2. Editor Files

#### `frontend/lib/editor/tenant-product.ts`

Status now:
- Has API migration comments.
- `create`, `update`, and `delete` are still placeholder return values.

Required change:
- Replace draft save/create/update/delete bodies with real API calls.
- Keep payload-builder helpers intact.

Risk if skipped:
- Product CRUD looks wired but does not persist to backend.

#### `frontend/lib/editor/basket.ts`

Status now:
- Uses localStorage for all basket persistence.

Required change:
- Only rewire this if basket must move to backend now.
- If basket remains client-only for now, do not block mock-data deletion on this file.

Risk if skipped:
- No risk to deleting `frontend/data/*`, but basket still remains browser-local instead of server-backed.

### 3. Search and Fetch Helpers

#### `frontend/lib/search.ts`

Status now:
- Uses `getTenantProducts`, `getAdminCategories`, and tenant lookups synchronously.

Required change:
- Either move search to backend with debounced async requests, or preload the data needed for local search before rendering the search UI.

Risk if skipped:
- Search bar and marketplace filter still assume instant in-memory data.

#### `frontend/fetch/tenant-product.ts`

Status now:
- Only wraps the mock-backed `getTenantProductById` helper.

Required change:
- Convert this to a real API client.
- Keep it as a fetch layer file, do not delete it unless replaced by a better-organized API client module.

Risk if skipped:
- The fetch layer remains a fake wrapper and gives no real migration benefit.

### 4. UI Files That Need Async Adaptation

These files currently call synchronous getters during render and will likely need refactoring once domain functions become async:

1. `frontend/components/tennant/dashboard_page.tsx`
2. `frontend/components/customer/product_page.tsx`
3. `frontend/components/marketplace/Catalog.tsx`
4. `frontend/components/customer/history.tsx`
5. `frontend/components/system/TransactionDetails.tsx`
6. `frontend/app/tennant/t_transaction/page.tsx`
7. `frontend/components/system/SearchBar.tsx`
8. `frontend/components/admin/a_dashboard.tsx`
9. `frontend/components/customer/tenant_page.tsx`
10. `frontend/components/user/customer/product_page.tsx`
11. `frontend/components/user/customer/tenant_page.tsx`
12. `frontend/components/user/tennant/dashboard_page.tsx`

Required change:
- Move data loading to server components, `useEffect`, or a dedicated client data layer.
- Do not assume you can just rename DAO functions and keep synchronous render-time access.

## Delete Gate

Before deleting `frontend/data/`, confirm all of the following:

1. `@/data/` has zero matches in frontend source.
2. Purchase-order screens still render complete data.
3. Marketplace, product page, tenant page, and search still load.
4. Product CRUD persists through backend.
5. Any remaining local-only behavior is intentional.
6. `frontend/lib/domain/index.ts` is removed only if it has zero imports.

## Short Answer

Deleting `frontend/data/*` requires a frontend rewiring pass.

It is not just function naming in CRUD or DAO.