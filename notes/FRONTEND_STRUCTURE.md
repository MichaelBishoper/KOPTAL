# Frontend Structure Explained

Every file has a purpose. This is what each folder does and what files matter.

---

## 📁 Core Folders

### `app/` - Routes (DON'T EDIT - These auto-generate from folder names)
```
app/
├── layout.tsx           → Main layout wrapper
├── page.tsx             → Home page (/)
├── admin/
│   └── a_dashboard/     → Admin dashboard (/admin/a_dashboard)
├── customer/
│   ├── basket/          → Shopping cart (/customer/basket)
│   ├── c_transaction/   → Order history (/customer/c_transaction)
│   ├── marketplace/     → Product catalog (/customer/marketplace)
│   ├── product/[id]/    → Product details (/customer/product/123)
│   └── tennant/         → Tenant profile (/customer/tennant?name=XYZ)
├── tennant/
│   ├── product/         → Tenant product list (/tennant/product)
│   ├── product_add/     → Add new product (/tennant/product_add)
│   ├── t_dashboard/     → Tenant inventory (/tennant/t_dashboard)
│   └── t_transaction/   → Tenant orders (/tennant/t_transaction)
└── user/                → User login/profile (/user)
```

**Rule**: Each folder = URL segment. File names auto-create routes. Don't rename folders.

---

### `components/` - Reusable UI Components

#### `system/` - Global components used everywhere
```
Navbar.tsx              → Header with navigation, search bar
Banner.tsx              → Top promotional banner
SearchBar.tsx           → Dropdown search with real-time results
Footer.tsx              → Bottom footer
Gap.tsx                 → Spacing component
```

#### `customer/` - Customer role components
```
product_details.tsx     → Product info + add to basket (shared detail page)
product_page.tsx        → Wrapper for customer product view
tenant_page.tsx         → Wrapper for tenant shop profile
product_cart_box.tsx    → Cart item display
history.tsx             → Order history table with statuses
PO_Details.tsx          → Purchase order details (expanded view)
```

#### `tennant/` - Tenant/seller role components
```
product_editor.tsx      → Form to create/edit products (add/edit page)
dashboard_page.tsx      → Tenant inventory dashboard
```

#### `marketplace/` - Marketplace display
```
Catalog.tsx             → Product grid (used on marketplace, shop, dashboard)
```

**Rule**: Import components from here. All use `@/lib` for data, never `@/data` directly.

---

### `lib/` - THE MOST IMPORTANT FOLDER ⭐

This is where backend integration happens. **Only change these files when connecting backend**.

```
lib/
├── index.ts                    → Exports all functions (PUBLIC API)
├── search.ts                   → Search logic (dropdown + filtering)
├── formatCurrency.ts           → Currency formatting
└── domain/                     → DOMAIN LAYER (data source layer)
    ├── tenant-products.ts      → Get/save products (calls @/data/tenant-products)
    ├── admins.ts               → Get/save admin data
    ├── tenants.ts              → Get/save tenant data
    ├── units.ts                → Get/save units
    ├── purchase-orders.ts      → Get/save purchase orders
    └── customers.ts            → Get/save customer data
```

**What domain layer does:**
- Currently imports from `@/data/` (mock data)
- When backend ready: imports from `@/fetch/` (API clients)
- Function signatures stay identical, components never break

**Example:**
```typescript
// Current (mock)
import { tenantProducts } from "@/data/tenant-products";
export const getTenantProducts = () => tenantProducts;

// After backend (API)
import { getTenantProductsFromAPI } from "@/fetch/tenant-products";
export const getTenantProducts = async () => await getTenantProductsFromAPI();
```

---

### `data/` - Mock Data (REPLACE THIS WITH API)
```
admins.ts               → Mock admin data
customers.ts            → Mock customer data
tenants.ts              → Mock tenant data
units.ts                → Mock units (kg, lbs, etc)
tenant-products.ts      → Mock products
purchase-orders.ts      → Mock purchase orders
po-line-items.ts        → Mock line items
```

**When backend is ready:**
- Create `fetch/` folder with API clients
- These files can be deleted
- lib/domain will import from fetch instead

---

### `structure/` - Type Definitions (Backend must match these!)

```
db.ts                   → TypeScript types for all entities
tenant-product.ts       → Extended product type with computed fields
```

**Critical**: Backend API responses must match types in `db.ts` EXACTLY.

---

### `fetch/` - API Clients (Create these when integrating backend)

```
fetch/
├── tenant-products.ts   → API calls for products
├── admins.ts            → API calls for admins
├── tenants.ts           → API calls for tenants
├── units.ts             → API calls for units
└── purchase-orders.ts   → API calls for orders
```

These will be created during backend integration phase.

---

## 🔄 Data Flow

### Current Flow (Mock Data)
```
Components (page.tsx, component.tsx)
    ↓
Imports from @/lib (search.ts, lib/domain/*)
    ↓
lib/domain/* imports from @/data/*
    ↓
Mock data displays in UI
```

### After Backend Integration
```
Components (page.tsx, component.tsx)
    ↓
Imports from @/lib (search.ts, lib/domain/*)
    ↓
lib/domain/* imports from @/fetch/*
    ↓
@/fetch/* calls backend API
    ↓
API returns real data from database
    ↓
Components display real data
```

**Key Point**: Components code doesn't change. Only lib/domain changes.

---

## 📄 File Purpose Summary

| File | Purpose | Touches |
|------|---------|---------|
| `app/**/*.tsx` | Routes | Don't touch (auto-generated) |
| `components/**/*.tsx` | UI | Edit freely, import from `@/lib` |
| `lib/index.ts` | Public API | Update when adding functions |
| `lib/domain/*.ts` | Data layer | Update for backend integration |
| `lib/search.ts` | Search logic | Works as-is, uses lib/domain |
| `structure/db.ts` | Type definitions | Share with backend team |
| `data/*.ts` | Mock data | Will be deleted after backend |
| `fetch/*.ts` | API clients | Create during integration |

---

## 💾 What Gets Saved Where

### LocalStorage (Frontend only)
```
"koptal_admin_categories"   → Categories list (admin adds them)
"koptal_basket_items"       → Shopping cart items
```

### Cookies (Frontend only)
```
"koptal_role"               → User role (guest/customer/tennant/admin)
```

### Database (Backend needs to implement)
```
Products, Orders, Users, Categories, Units, Purchase Orders, Line Items
```

---

## ✅ Files You'll Actually Edit

### For Building Features
- `components/customer/*.tsx` - New customer features
- `components/tennant/*.tsx` - New tenant features
- `components/admin/*.tsx` - New admin features
- `lib/index.ts` - Export new functions

### For Connecting Backend
- `lib/domain/*.ts` - Update to use API clients
- Create `fetch/*.ts` - API client functions

### Never Edit
- `app/**` - Routes auto-generate
- `structure/db.ts` - Types must match backend
- `data/**` - Will be deleted

---

## 🎯 Quick Reference

**Where's the product list?**
→ `components/marketplace/Catalog.tsx` + `lib/domain/tenant-products.ts`

**Where's the search?**
→ `components/system/SearchBar.tsx` + `lib/search.ts`

**Where's the shopping cart logic?**
→ `lib/domain/customers.ts` (getBasketItems, addBasketItem)

**Where's the order logic?**
→ `lib/domain/purchase-orders.ts`

**Where are mock products?**
→ `data/tenant-products.ts`

**Where do I add a new function?**
→ Create in `lib/domain/*.ts`, export in `lib/index.ts`

---

**That's the structure. When backend is ready, come back here and follow the integration guide.**
