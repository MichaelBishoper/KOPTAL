# KOPTAL - Marketplace Platform

A modern, role-based agricultural marketplace connecting farmers (tenants) with buyers (customers) through a centralized platform.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000`

**Test Accounts** (set cookies in browser dev tools):
- Customer: `koptal_role=customer`
- Tenant: `koptal_role=tennant`
- Admin: `koptal_role=admin`

---

## 📚 Documentation for Your Team

| Document | Read This For |
|----------|---------------|
| **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** | How to build features ⭐ Start here |
| **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** | How to connect backend API |
| **[LOGGING_SETUP.md](./LOGGING_SETUP.md)** | How to set up logging |
| **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** | What's left to do & roadmap |

---

## 🎯 Project Overview

### Roles & Permissions

| Role | Access | Can Do |
|------|--------|--------|
| **Guest** | Marketplace | Browse & search products |
| **Customer** | Marketplace + Cart | Buy products, track orders |
| **Tenant** | Dashboard + Products | Sell products, manage inventory |
| **Admin** | Dashboard | Manage categories |

### Features

✅ Marketplace with product catalog  
✅ Advanced search (dropdown + filtering)  
✅ Shopping cart management  
✅ Order lifecycle (Pending → Accepted → Delivered)  
✅ Tenant product management  
✅ Admin category approval  
✅ Transaction history  

---

## 🏗️ Architecture

**Key Principle**: Keep a stable API layer. Components import from `@/lib` only.

```
Data Sources (@/data or API)
        ↓
Stable Mappings (@/lib/domain)  ← Only place that changes
        ↓
Components (@/components)  ← Never changes
```

### Folder Structure

```
frontend/
├── app/              # Routes (don't edit)
├── components/       # UI (import from @/lib only)
├── lib/             # ⭐ API layer (edit here for backend)
│   ├── domain/      # Business logic
│   ├── editor/      # Form state
│   └── index.ts     # Public exports
├── data/            # Mock data (replace with API)
└── structure/       # Type definitions
```

---

## 🚀 Key Functions

### Products
```typescript
import { getTenantProducts, toProductDetails, toCatalogCard } from "@/lib";

const all = getTenantProducts();           // All products
const one = getTenantProductById(1);       // Single product
const details = toProductDetails(product); // For product page
const card = toCatalogCard(product);       // For marketplace
```

### Search
```typescript
import { searchProductsAndCategories, filterProductsBySearch } from "@/lib";

const dropdown = searchProductsAndCategories("tomato");  // Max 10 results
const filtered = filterProductsBySearch("tomato");       // All matches
```

### Orders
```typescript
import { getPurchaseOrders, getStatusLabel } from "@/lib";

const orders = getPurchaseOrders();
orders.forEach(o => console.log(getStatusLabel(o.status)));
// "Pending", "On the way", "Delivered", "Cancelled"
```

### Admin
```typescript
import { getAdminCategories, saveAdminCategories } from "@/lib";

const cats = getAdminCategories();  // Approved categories
saveAdminCategories([...cats, "Fruits"]);  // Add category
```

### Cart
```typescript
import { getBasketItems, addBasketItem, removeBasketItem } from "@/lib";

const items = getBasketItems();
addBasketItem(productId);
removeBasketItem(productId);
```

See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for complete API reference.

---

## 📋 Development Rules

✅ **DO THIS**
```typescript
// Import from @/lib only
import { getTenantProducts } from "@/lib";
const products = getTenantProducts();
```

❌ **DON'T DO THIS**
```typescript
// Direct data import bypasses the API layer
import { tenantProducts } from "@/data/tenant-products";

// Direct API calls in components
fetch('/api/products').then(...);
```

---

## 🔌 Connecting Backend

When backend is ready:

1. Create `frontend/fetch/*.ts` API clients
2. Update `frontend/lib/domain/*.ts` to use APIs
3. **Components need ZERO changes** ✨

See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for step-by-step guide.

---

## 📊 Status Values

| Value | Meaning | Color |
|-------|---------|-------|
| `Pending` | Awaiting decision | Light blue |
| `Ontheway` | Accepted & shipping | Orange |
| `Delivered` | Complete | Green |
| `Cancelled` | Rejected | Red |

---

## 🎨 Styling

- **Primary Color**: `#01A49E` (teal) - navbar, accents
- **Secondary**: `#057f7b` (dark teal) - footer
- **Framework**: Tailwind CSS
- **Icons**: Heroicons

---

## 🔧 Common Tasks

### Show Products
```typescript
import { getTenantProducts, toCatalogCard } from "@/lib";

export function ProductList() {
  const products = getTenantProducts().map(toCatalogCard);
  return <div>{/* render */}</div>;
}
```

### Search
```typescript
import { searchProductsAndCategories } from "@/lib";

const results = searchProductsAndCategories("tomato");
```

### Add Product
```typescript
import { createEmptyProductDraft, saveTenantProductDraft } from "@/lib";

const draft = createEmptyProductDraft();
draft.name = "Tomato";
draft.category = "Vegetables";
await saveTenantProductDraft(draft, null);
```

See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for more examples.

---

## 🆘 Troubleshooting

**Products not showing?**
- Check category exists: `getAdminCategories()`
- Check tenant exists: `getTenantById(productId)`

**TypeScript errors?**
- Run `npm run build` to see all errors
- Check `structure/db.ts` for type definitions

**Backend not connecting?**
- Check `process.env.NEXT_PUBLIC_API_URL`
- Check network tab in DevTools
- Read [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)

---

## 📈 What's Next

**Phase 1: Backend Integration** (2-3 weeks)
- Create API endpoints
- Update `lib/domain/*.ts`
- Connect frontend

**Phase 2: Logging Setup** (1 week)
- Add frontend logging
- Add backend logging
- Set up monitoring

**Phase 3: Testing & Deploy** (1-2 weeks)
- End-to-end testing
- Staging verification
- Production launch

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for full roadmap.

---

## 👥 Team Guide

1. **Frontend devs**: Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
2. **Backend devs**: Read [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
3. **DevOps**: Read [LOGGING_SETUP.md](./LOGGING_SETUP.md)
4. **Everyone**: Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for timeline

---

## ✨ Status

| Component | Status |
|-----------|--------|
| Frontend UI | ✅ Complete |
| Data Layer | ✅ Complete |
| Architecture | ✅ Complete |
| Backend | ⏳ Next Phase |
| Logging | ⏳ Next Phase |

**Frontend Ready for Backend Integration** 🚀

---

**Last Updated**: May 14, 2026  
**Version**: 1.0 Production Ready
