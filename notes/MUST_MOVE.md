Updated backend-authoritative checklist

Done recently
1. Frontend tax adjustment has been disabled.
2. Tax rate is no longer writable from localStorage/UI controls.

Still must move to backend (or backend-authoritative)
1. Authentication and session issuance
- Role and user identity cookies must be issued and validated by backend, not client JS.
- Current frontend touchpoints: app/login/page.tsx, lib/cookies/client.ts, middleware.ts

2. Authorization checks
- Route-role checks should rely on verified server session claims, not plain role cookie values.
- Current checks: middleware.ts, app/customer/layout.tsx, app/admin/layout.tsx, app/tennant/layout.tsx

3. Basket create/update/remove
- Add-to-basket should call backend CRUD, not local draft/localStorage.
- Current frontend logic: components/customer/product_cart_box.tsx, lib/editor/basket.ts

4. Checkout and order creation
- Final payment submit should create/update purchase order server-side, including selected shipping address.
- Current frontend flow: app/system/checkout/page.tsx, components/system/CheckoutPageContent.tsx

5. Order status transitions
- Tenant accept/reject and customer delivered should be backend mutations with audit trail.
- Current UI-side transitions: app/tennant/t_transaction/page.tsx, components/customer/history.tsx

6. Tax rate source of truth
- Remaining step: serve tax from backend config/API instead of frontend mock/default data.
- Current frontend read path: components/admin/TaxSettings.tsx, lib/domain/admins.ts

7. User profile update
- Edit profile save must call backend update endpoint and persist to DB.
- Current local-only behavior: components/system/UserProfile.tsx

8. Product CRUD and inventory updates
- Tenant product add/edit/delete and stock consistency should be backend-enforced.
- Current frontend domain/editor: lib/editor/tenant-product.ts, lib/domain/tenant-products.ts

9. Purchase order and line item data retrieval
- Replace direct mock-data reads with API fetch adapters.
- Current mock-coupled domain: lib/domain/purchase-orders.ts, data/purchase-orders.ts

10. Sensitive business rules and validation
- Price, subtotal, tax amount, total amount, and allowed transitions must be computed and validated server-side.

Cross-cutting backend requirements
1. Input validation and schema enforcement on every API endpoint.
2. Rate limiting and brute-force protection (especially login/auth routes).
3. Audit logging for sensitive actions (session/role changes, tax config changes, order status updates).
4. Error and monitoring pipeline (structured logs + alerting).
5. File upload security checks if image uploads are enabled (type/size validation, signed URLs, malware scanning if needed).