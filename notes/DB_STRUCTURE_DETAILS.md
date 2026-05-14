# Database Structure & Details

What the frontend reads, how data flows, and important details about the system.

---

## 📋 Database Entities

Frontend expects these exact TypeScript types from backend:

### AdminRow - Manager users
```typescript
{
  manager_id: number;
  name: string;
  email: string;
  phone: string;
  categories: string[];           // List of approved categories
  password_hash: string;
  created_at: string;             // ISO format "2024-01-15T10:30:00Z"
}
```
**What frontend does**: Display categories list, allow add/remove categories
**Stored in**: `lib/domain/admins.ts` → `getAdminCategories()`

---

### CustomerRow - Buyers
```typescript
{
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  tax_id: string;
  billing_address: string;
  shipping_address: string;
  password_hash: string;
  created_at: string;
}
```
**What frontend does**: Show in orders, show in customer profile
**Stored in**: `lib/domain/customers.ts`

---

### TenantRow - Sellers/Shops
```typescript
{
  tenant_id: number;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  location?: string;              // City/region (displayed next to product)
  image?: string;                 // Shop logo/image
  password_hash: string;
  created_at: string;
}
```
**What frontend does**: Show shop name + location on products, show on tenant profile page
**Stored in**: `lib/domain/tenants.ts` → `getTenantById(id)`

---

### TenantProductRow - Products for sale
```typescript
{
  product_id: number;
  tenant_id: number;              // Link to seller
  unit_id: number;                // Link to units (kg, lbs, etc)
  name: string;
  category: string;               // Must be in admin approved categories
  quantity: number;               // Available stock
  price: number;                  // Per unit (e.g., price per kg)
  image?: string;                 // Product photo URL
  description?: string;
}
```
**What frontend does**: Display in marketplace, show in search, add to cart
**Stored in**: `lib/domain/tenant-products.ts` → `getTenantProducts()`
**Important**: Category MUST exist in admin categories list

---

### UnitRow - Units of measurement
```typescript
{
  unit_id: number;
  unit_name: string;              // "Kilogram", "Pound", "Liter"
  unit_symbol: string;            // "kg", "lbs", "L"
  unit_type: string;              // "Weight", "Volume", "Quantity"
}
```
**What frontend does**: Show unit symbol next to price (e.g., "15.50 per kg")
**Stored in**: `lib/domain/units.ts` → `getUnitLabel(unit_id)`

---

### PurchaseOrderRow - Orders
```typescript
{
  po_id: number;
  po_number: string;              // Readable order number "PO-2024-0001"
  customer_id: number;            // Link to customer
  tenant_id: number;              // Link to seller
  status: string;                 // "Pending" | "Ontheway" | "Delivered" | "Cancelled"
  order_date: string;             // ISO format
  shipping_address: string;
  notes: string;
  subtotal: number;               // Sum of line items
  tax_amount: number;
  total_amount: number;           // subtotal + tax
}
```
**What frontend does**: Display in customer orders, tenant orders, show status
**Stored in**: `lib/domain/purchase-orders.ts`

---

### PoLineItemRow - Order line items
```typescript
{
  po_item_id: number;
  po_id: number;                  // Link to purchase order
  product_id: number;             // Link to product
  quantity: number;               // How many units ordered
  unit_price: number;             // Price at time of order
  subtotal: number;               // quantity × unit_price
}
```
**What frontend does**: Show items in order detail view
**Stored in**: Linked in `lib/domain/purchase-orders.ts`

---

## 🔄 Data Relationships

```
Admin (1) --manages--> (many) Categories
                |
                └--> TenantProduct.category

Customer (1) --places--> (many) PurchaseOrder

Tenant (1) --sells--> (many) TenantProduct
              |
              └--> PurchaseOrder.tenant_id

TenantProduct --uses--> Unit
               |
               └--> PurchaseOrderLineItem.product_id

PurchaseOrder (1) --contains--> (many) PoLineItem
```

---

## 📊 Data Flow: How Frontend Uses Data

### Product Marketplace
```
Backend: TenantProduct + Tenant + Unit tables
    ↓
API: GET /api/tenant-products
    ↓
Frontend fetch: getTenantProductsFromAPI()
    ↓
lib/domain: getTenantProducts()
    ↓
Components: Catalog.tsx displays products
    ↓
Browser: Shows product name, price per unit, seller name, location
```

### Search
```
User types in SearchBar
    ↓
searchProductsAndCategories(query)
    ↓
Searches TenantProduct.name, TenantProduct.category
    ↓
For each product result: getTenantById(product.tenant_id)
    ↓
Shows: product name + tenant name + location
```

### Shopping Cart
```
User clicks "Add to Cart"
    ↓
addBasketItem(product_id) in lib/domain/customers.ts
    ↓
Saves to localStorage: "koptal_basket_items"
```

### Checkout → Create Order
```
User clicks "Checkout"
    ↓
Create PurchaseOrder with:
  - customer_id (from auth token)
  - po_number (generated by backend)
  - items (from basket)
  - status: "Pending"
    ↓
API: POST /api/purchase-orders
    ↓
Backend creates PurchaseOrder + PoLineItem rows
    ↓
Frontend resets basket
```

### Customer Views Order
```
User goes to /customer/c_transaction
    ↓
getPurchaseOrders() filters by customer_id
    ↓
Shows: PO number, date, items, status
    ↓
Status colors:
  - Pending: blue (admin reviewing)
  - Ontheway: amber (shipped)
  - Delivered: green (received)
  - Cancelled: red (rejected)
```

### Tenant Accepts/Rejects Order
```
Tenant sees order in /tennant/t_transaction
    ↓
Tenant clicks "Accept" or "Reject"
    ↓
If Accept: PurchaseOrder.status = "Ontheway"
If Reject: PurchaseOrder.status = "Cancelled"
    ↓
API: PUT /api/purchase-orders/:po_id/status
    ↓
Customer sees updated status
```

---

## 🔑 Important Rules

### Rule 1: Categories Must Be Pre-Approved
```
Admin adds "Grains", "Vegetables", "Dairy"
    ↓
When tenant creates product:
  - Must select category from admin list
  - Can't create custom category
    ↓
If category not in list:
  - Product won't show in marketplace
  - Search won't find it
```

**Implementation**: `product_editor.tsx` validates category exists in `getAdminCategories()`

---

### Rule 2: Products Must Have Units
```
Every TenantProduct has unit_id
Every unit_id must exist in Units table
If unit not found:
  - Price display breaks
  - Shows "[unknown unit]"
    ↓
Always check: getUnitLabel(unit_id) returns valid string
```

---

### Rule 3: Orders Need Tenant Acceptance
```
Customer creates order → status: "Pending"
    ↓
Order sits in tenant's /t_transaction
    ↓
Tenant MUST explicitly accept or reject
    ↓
Only then does customer see "Ontheway" or "Cancelled"
    ↓
Frontend shows "Awaiting Acceptance" for Pending orders
```

---

### Rule 4: Basket is Local Only
```
Basket stored in localStorage: "koptal_basket_items"
    ↓
Not synced to backend until checkout
    ↓
If user clears browser data → basket gone
    ↓
If user logs out → can still see basket (different session)
```

---

## 🎯 What Frontend Needs From Backend

### On Initial Load
1. List of all categories (for admin dashboard, product creation)
2. List of all units (kg, lbs, liters, etc)
3. List of all tenants (for shop links)
4. List of all products (for marketplace)

### On Each Page Load
1. Current user ID (from JWT token)
2. Current user role (admin/customer/tenant/guest)
3. Their orders (filtered by customer_id or tenant_id)

### Real-Time Operations
- Create product: POST with tenant_id from token
- Create order: POST with customer_id from token, po_number auto-generated
- Update order status: PUT with validation that tenant owns order

---

## 💾 What Frontend Stores Locally

### localStorage
```
"koptal_basket_items": [
  { product_id, quantity, tenant_id },
  ...
]
```

### Cookies
```
"koptal_role": "customer|tenant|admin|guest"
"koptal_token": "jwt-token-string"  (if implementing auth)
```

### Session (in memory)
- Search results (cleared on each search)
- Form state (cleared on page reload)
- Component state (useState hooks)

---

## 🚨 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Products don't show in marketplace | category not in admin list | Admin must add category first |
| Price shows as "undefined per unit" | unit_id not found in Units table | Check database, add missing unit |
| Order stuck on "Pending" forever | Tenant never accepted it | Tenant must click Accept in /t_transaction |
| Product shows on edit but not marketplace | Product wasn't saved to DB | Save completes but API didn't return product |
| Search shows product but product page 404 | Product.product_id doesn't match URL | Check API response has correct product_id |
| Basket items disappear | Browser cleared localStorage | Educate users not to clear cache |

---

## 📐 Frontend Type System

All types in `frontend/structure/db.ts` must exactly match backend:

```typescript
// If backend sends:
{ "product_name": "Rice" }

// But frontend expects:
{ "name": "Rice" }

// Result: Component shows undefined!
```

**Solution**: Backend team must confirm API response matches types in `db.ts` before frontend integration.

---

## 🔐 Authentication Flow

```
User logs in with email + password
    ↓
Backend: Verify credentials
    ↓
Backend: Generate JWT token (includes user_id + role)
    ↓
Frontend: Store token in localStorage or cookie
    ↓
Frontend: Send token in every API request header:
  "Authorization": "Bearer {token}"
    ↓
Backend: Verify token in middleware
    ↓
Backend: Attach user_id to request
    ↓
Controllers use user_id to filter data:
  - Customer only sees their orders
  - Tenant only sees their products + orders
  - Admin sees all categories
```

---

**Summary**: Frontend displays what backend provides. If data structure doesn't match `db.ts`, frontend breaks. Keep types in sync!
