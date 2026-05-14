# Backend Integration Guide

How to connect frontend to backend API. Frontend uses DAO + Controllers pattern.

---

## 🏗️ Backend Structure Expected

```
services/iam/
├── routers/
│   ├── authRoute.js
│   ├── adminRoutes.js
│   ├── customerRoutes.js
│   ├── tenantRoutes.js
│   └── publicRoutes.js
├── dao/
│   ├── adminDao.js       → Query admin table
│   ├── customerDao.js     → Query customer table
│   └── tenantDao.js       → Query tenant table
├── middleware/
│   └── auth.js            → JWT verification
└── server.js

services/monolith/
├── src/
│   ├── routes/
│   │   ├── tenantProductsRoutes.js
│   │   └── unitsRoutes.js
│   ├── controllers/
│   │   ├── tenantProductsController.js
│   │   └── unitsController.js
│   └── dao/
│       ├── tenantProductsDao.js
│       └── unitsDao.js
└── index.js
```

---

## 🔗 Integration Steps

### Step 1: Create API Client Layer

Create `frontend/fetch/` folder with API clients.

**frontend/fetch/tenant-products.ts**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getTenantProductsFromAPI(): Promise<TenantProductRow[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tenant-products`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getTenantProductFromAPI(id: number): Promise<TenantProductRow | null> {
  try {
    const res = await fetch(`${API_BASE}/api/tenant-products/${id}`, {
      headers: { "Authorization": `Bearer ${getToken()}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export async function saveTenantProductToAPI(product: TenantProductRow): Promise<TenantProductRow | null> {
  try {
    const method = product.product_id ? "PUT" : "POST";
    const url = product.product_id 
      ? `${API_BASE}/api/tenant-products/${product.product_id}`
      : `${API_BASE}/api/tenant-products`;
    
    const res = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to save product:", error);
    return null;
  }
}

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("koptal_token") || "";
}
```

**Same pattern for:**
- `frontend/fetch/admins.ts` → `GET /api/admins`, `PUT /api/admins`
- `frontend/fetch/tenants.ts` → `GET /api/tenants`, `GET /api/tenants/:id`
- `frontend/fetch/units.ts` → `GET /api/units`
- `frontend/fetch/purchase-orders.ts` → `GET /api/purchase-orders`, `POST /api/purchase-orders`

---

### Step 2: Update Domain Layer

Update `lib/domain/*.ts` to use API clients instead of mock data.

**frontend/lib/domain/tenant-products.ts (BEFORE)**
```typescript
import { tenantProducts } from "@/data/tenant-products";

export function getTenantProducts() {
  return tenantProducts;
}

export function getTenantProductById(id: number) {
  return tenantProducts.find(p => p.product_id === id);
}
```

**frontend/lib/domain/tenant-products.ts (AFTER)**
```typescript
import { 
  getTenantProductsFromAPI, 
  getTenantProductFromAPI,
  saveTenantProductToAPI 
} from "@/fetch/tenant-products";

export async function getTenantProducts() {
  return await getTenantProductsFromAPI();
}

export async function getTenantProductById(id: number) {
  return await getTenantProductFromAPI(id);
}

export async function saveTenantProduct(product) {
  return await saveTenantProductToAPI(product);
}
```

**Key**: Keep function signatures identical. Components don't change.

---

### Step 3: Update Route Pages (if needed)

If domain functions became async, update route pages:

**frontend/app/customer/marketplace/page.tsx**
```typescript
"use client";
import { Catalog } from "@/components/marketplace/Catalog";
import { getTenantProducts } from "@/lib";
import { useEffect, useState } from "react";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <Catalog products={products} />;
}
```

---

## 🔄 Expected API Endpoints

Backend must provide these endpoints. Frontend calls them.

### Tenant Products
```
GET    /api/tenant-products              → Returns TenantProductRow[]
GET    /api/tenant-products/:id          → Returns TenantProductRow
POST   /api/tenant-products              → Create, body: TenantProductRow
PUT    /api/tenant-products/:id          → Update, body: TenantProductRow
DELETE /api/tenant-products/:id          → Delete
```

### Admins
```
GET    /api/admins                       → Returns AdminRow[]
GET    /api/admins/:id                   → Returns AdminRow
PUT    /api/admins/:id                   → Update categories
```

### Tenants
```
GET    /api/tenants                      → Returns TenantRow[]
GET    /api/tenants/:id                  → Returns TenantRow
```

### Units
```
GET    /api/units                        → Returns UnitRow[]
GET    /api/units/:id                    → Returns UnitRow
```

### Purchase Orders
```
GET    /api/purchase-orders              → Returns PurchaseOrderRow[]
GET    /api/purchase-orders/:id          → Returns with line items
POST   /api/purchase-orders              → Create order
PUT    /api/purchase-orders/:id/status   → Update status (Pending→Ontheway→Delivered)
```

### Customers
```
GET    /api/customers/:id                → Returns CustomerRow
PUT    /api/customers/:id                → Update customer
```

---

## 🔐 Authentication

All endpoints need JWT token in header:

```
Authorization: Bearer {token}
```

Backend should:
1. Verify token in auth middleware
2. Attach user_id to request
3. Return 401 if invalid

Frontend provides token:
```typescript
const token = localStorage.getItem("koptal_token");
const headers = { "Authorization": `Bearer ${token}` };
```

---

## 📊 Response Format

All API responses must match types in `frontend/structure/db.ts`:

```typescript
// Backend returns this structure exactly
{
  product_id: 1,
  tenant_id: 2,
  unit_id: 3,
  name: "Rice 10kg",
  category: "Grains",
  quantity: 100,
  price: 25.50,
  image: "url-or-path",
  description: "High quality rice"
}
```

**If field names don't match, component will break.**

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Backend API deployed and accessible
- [ ] API returns data in correct format (matches `db.ts`)
- [ ] JWT token generation working
- [ ] CORS headers allow frontend origin
- [ ] All endpoints implemented
- [ ] Error handling for failed requests
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Frontend `fetch/*.ts` created
- [ ] Frontend `lib/domain/*.ts` updated
- [ ] Test all features with real data
- [ ] Logging configured (see LOGGING_SYSTEM.md)
- [ ] Database migrations run

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "CORS error" | Add `res.header('Access-Control-Allow-Origin', '*')` in backend |
| "401 Unauthorized" | Check JWT token expiry, verify in auth middleware |
| "Products not showing" | API returned wrong field names, check `db.ts` |
| "Network error" | Check `NEXT_PUBLIC_API_URL` environment variable |
| "Blank products" | API returned empty array, check backend database |
| "Form won't save" | Check POST/PUT endpoint, verify request body format |

---

## 💡 Pro Tips

1. **Test API first** - Use Postman/curl before connecting frontend
2. **Mock first** - Keep `data/` folder until API is 100% ready
3. **Error handling** - Frontend should handle null/undefined gracefully
4. **Logging** - Add console.log to `fetch/*.ts` for debugging
5. **Environment** - Use `.env.local` for API URL in development

---

**Backend team**: This is what frontend needs. Frontend team: Don't touch this file, it's for coordination.**
