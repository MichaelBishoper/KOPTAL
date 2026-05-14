# 📚 KOPTAL Documentation

Complete guide to the marketplace platform. Start here.

---

## 🎯 Quick Navigation

### I'm a **New Developer**
1. Read this page (you're reading it!)
2. Read [FRONTEND_STRUCTURE.md](FRONTEND_STRUCTURE.md) - Understand folder layout
3. Run `cd frontend && npm run dev` - See it work
4. Read [DB_STRUCTURE_DETAILS.md](DB_STRUCTURE_DETAILS.md) - Understand data flow

**Time**: 30 minutes  
**Result**: You understand how the app works

---

### I'm **Building a Feature**
1. [FRONTEND_STRUCTURE.md](FRONTEND_STRUCTURE.md) - Find the right component folder
2. Check `frontend/lib/index.ts` - See available functions
3. Import from `@/lib`, build component
4. Test with mock data

**Time**: Depends on feature  
**Example**: Add new admin feature → edit `components/admin/`, import from `@/lib`

---

### I'm **Integrating Backend**
1. [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) - Step-by-step guide
2. Create `frontend/fetch/*.ts` API clients
3. Update `frontend/lib/domain/*.ts` to use APIs
4. Components don't change!

**Time**: 3-4 days  
**Owner**: Backend + Frontend collaboration

---

### I'm **Setting Up Backend**
1. [DB_STRUCTURE_DETAILS.md](DB_STRUCTURE_DETAILS.md) - Understand data model
2. [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) - See required endpoints
3. Create DAO + Controllers
4. Test with Postman

**Time**: 5-7 days  
**Files**: `frontend/structure/db.ts` has exact types you need

---

### I'm **Deploying to Production**
1. [TODO_ROADMAP.md](TODO_ROADMAP.md) - See Phase 3 (Deployment)
2. Build frontend: `npm run build`
3. Deploy backend and frontend
4. Configure environment variables

**Time**: 2-3 days  
**Checklist**: See "Deployment Complete" in TODO_ROADMAP.md

---

## 📖 All Documents

| Document | Purpose | Read Time | Audience |
|----------|---------|-----------|----------|
| **FRONTEND_STRUCTURE.md** | Folder layout & file purposes | 15 min | Frontend devs |
| **BACKEND_INTEGRATION.md** | How to connect API | 20 min | Backend + Frontend |
| **DB_STRUCTURE_DETAILS.md** | Database entities & flows | 20 min | Backend + QA |
| **TODO_ROADMAP.md** | Remaining work & timeline | 15 min | Everyone |

---

## 🏗️ Architecture Overview

```
Frontend (Next.js 14)
├── Components (UI)
├── lib/ (Business Logic ⭐)
│   ├── domain/*.ts (Data layer - connects to API)
│   └── index.ts (Public API)
└── Routes (Auto-generated from folder names)

Backend (Node.js Express)
├── DAO (Database access)
├── Controllers (Business logic)
├── Routers (API endpoints)
└── Middleware (Auth, error handling)

Database (PostgreSQL/MySQL)
├── Users (Customers, Tenants, Admins)
├── Products (Tenant products for sale)
├── Orders (Purchase orders)
└── Units (kg, lbs, liters, etc)
```

---

## 🔑 One Rule to Rule Them All

**Frontend components ONLY import from `@/lib`, NEVER from `@/data` directly.**

Why? When backend is ready:
- Only `lib/domain/*.ts` needs to change
- `@/fetch/*.ts` replaces `@/data/*`
- Components don't break!

```typescript
✅ GOOD
import { getTenantProducts } from "@/lib";

❌ BAD
import { tenantProducts } from "@/data/tenant-products";
```

---

## 🚀 Current Status

### ✅ Complete (Frontend)
- Marketplace with product catalog
- Product search with dropdown
- Shopping cart (add/remove items)
- Order management (customer + tenant views)
- Admin category management
- Product editor for tenants
- Role-based UI (guest/customer/tenant/admin)
- Responsive design
- Type system (TypeScript strict)

### ⏳ In Progress (Backend)
- API endpoints (needs implementation)
- Database schema (needs implementation)
- Authentication (JWT recommended)

### 🔜 Next (Deployment)
- Logging system
- Production deployment
- Monitoring & alerts

---

## 📂 File Structure

```
KOPTAL/
├── frontend/                # React app (Next.js)
│   ├── lib/                # ⭐ Data & logic layer
│   ├── components/         # UI components
│   ├── app/                # Routes (don't edit)
│   ├── structure/db.ts     # Type definitions (share with backend!)
│   └── package.json
├── services/
│   ├── iam/               # User management (login, auth)
│   └── monolith/          # Business logic (products, orders)
├── notes/                  # This documentation
└── ddlTableCreate.txt     # SQL for database setup
```

---

## 🎯 How to Get Data Into Frontend

### Currently (Mock Data)
```
Components use @/lib
    ↓
@/lib imports from @/data
    ↓
Mock data displays
```

### After Backend (Real Data)
```
Components use @/lib (UNCHANGED!)
    ↓
@/lib imports from @/fetch
    ↓
@/fetch calls backend API
    ↓
API returns data from database
    ↓
Real data displays
```

**Components never change!**

---

## 🔐 Authentication

Frontend expects JWT token in localStorage:
```typescript
localStorage.setItem("koptal_token", jwtToken);
```

Every API request includes:
```
Authorization: Bearer {token}
```

Backend should verify token and attach user to request.

---

## 📊 Key Data Models

### Product (what tenants sell)
```
{
  product_id, tenant_id, unit_id,
  name, category, quantity, price,
  image, description
}
```

### Order (what customers purchase)
```
{
  po_id, po_number, customer_id, tenant_id,
  status (Pending→Accepted→Delivered),
  order_date, shipping_address,
  items: [ { product_id, quantity, unit_price } ]
}
```

### Tenant (seller)
```
{
  tenant_id, name, email, phone, verified,
  location, image
}
```

See [DB_STRUCTURE_DETAILS.md](DB_STRUCTURE_DETAILS.md) for complete data model.

---

## 💡 Key Concepts

### Role-Based Access
- **Guest**: Browse marketplace only
- **Customer**: Browse + buy + track orders
- **Tenant**: Manage products + see orders
- **Admin**: Manage categories + approve tenants

Set with cookie:
```
document.cookie = "koptal_role=customer";
```

### Shopping Cart
- Stored in localStorage (not backend)
- Survives logout
- Gets cleared on checkout

### Order Status Flow
```
Pending (admin reviewing)
    ↓
Accept/Reject (tenant decides)
    ↓
Ontheway (if accepted)
    ↓
Delivered (customer confirms)
```

### Categories
- Admin pre-approves categories
- Tenants can only use approved categories
- Must add category before tenant can use it

---

## 🛠️ Common Tasks

### Add a new page
1. Create folder in `app/`
2. Add `page.tsx` file
3. Import components from `components/`
4. Import functions from `@/lib`

### Add a new function
1. Create/edit file in `lib/domain/`
2. Export from `lib/index.ts`
3. Use in components

### Add a new component
1. Create file in `components/{role}/`
2. Import from `@/lib` for data
3. Use in route pages

### Connect to backend
1. See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)
2. Create `fetch/` clients
3. Update `lib/domain/` to use APIs

---

## 🆘 Troubleshooting

| Problem | Check |
|---------|-------|
| Frontend won't start | Run `npm install`, then `npm run dev` |
| Components show undefined | Are they importing from `@/lib`? |
| Products don't appear | Does category exist in admin categories? |
| Search doesn't work | Check browser console for errors |
| Types don't match | Is backend sending fields matching `structure/db.ts`? |

---

## ✅ Checklist for Launch

- [ ] Backend API endpoints implemented
- [ ] Frontend fetch clients created
- [ ] All features tested with real data
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Logging configured
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] SSL certificates configured
- [ ] Monitoring/alerts set up
- [ ] Team trained on documentation

---

## 📞 Questions?

1. **How do I build a feature?** → [FRONTEND_STRUCTURE.md](FRONTEND_STRUCTURE.md)
2. **How do I connect the backend?** → [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)
3. **What data does the frontend need?** → [DB_STRUCTURE_DETAILS.md](DB_STRUCTURE_DETAILS.md)
4. **What's left to do?** → [TODO_ROADMAP.md](TODO_ROADMAP.md)

---

**Start with one document. Master it. Then move to next. You got this! 🚀**
