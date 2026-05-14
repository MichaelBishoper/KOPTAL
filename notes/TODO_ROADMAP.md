# TODO: Remaining Work

What's left to do before launch. Organized by phase and priority.

---

## Phase 1: Backend Integration (Critical) ⏳

### Task 1.1: Design API Endpoints
- [ ] Backend team creates endpoints matching `frontend/structure/db.ts`
- [ ] Review endpoint list in [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)
- [ ] Decide on authentication method (JWT recommended)
- [ ] Set CORS headers for frontend origin

**Owner**: Backend Lead  
**Timeline**: 2-3 days  
**Blocker for**: Everything else

---

### Task 1.2: Implement Backend DAO + Controllers
- [ ] Create DAO layer for each entity (adminDao.js, customerDao.js, tenantDao.js, tenantProductsDao.js, unitsDao.js)
- [ ] Create controllers (adminController.js, customerController.js, tenantController.js, tenantProductsController.js, unitsController.js)
- [ ] Implement all CRUD operations (GET, POST, PUT, DELETE)
- [ ] Add JWT verification middleware
- [ ] Test with Postman/curl

**Owner**: Backend Developers  
**Timeline**: 5-7 days  
**Endpoints needed**: 16+ endpoints (see BACKEND_INTEGRATION.md)

---

### Task 1.3: Database Schema
- [ ] Create tables matching types in `frontend/structure/db.ts`
- [ ] Add foreign key relationships
- [ ] Add indexes for performance
- [ ] Create seed data for testing

**Owner**: Backend Lead  
**Timeline**: 2-3 days  
**Critical fields**: Ensure field names match exactly

---

### Task 1.4: Frontend API Clients
- [ ] Create `frontend/fetch/tenant-products.ts`
- [ ] Create `frontend/fetch/admins.ts`
- [ ] Create `frontend/fetch/tenants.ts`
- [ ] Create `frontend/fetch/units.ts`
- [ ] Create `frontend/fetch/purchase-orders.ts`
- [ ] Create `frontend/fetch/customers.ts`
- [ ] Test each client with backend API

**Owner**: Frontend Developer  
**Timeline**: 2-3 days  
**Template**: See BACKEND_INTEGRATION.md Step 1

---

### Task 1.5: Migrate Domain Layer
- [ ] Update `lib/domain/tenant-products.ts` to use `@/fetch/`
- [ ] Update `lib/domain/admins.ts` to use `@/fetch/`
- [ ] Update `lib/domain/tenants.ts` to use `@/fetch/`
- [ ] Update `lib/domain/units.ts` to use `@/fetch/`
- [ ] Update `lib/domain/purchase-orders.ts` to use `@/fetch/`
- [ ] Update `lib/domain/customers.ts` to use `@/fetch/`
- [ ] Handle async/await in route pages if needed
- [ ] Test all features with real data

**Owner**: Frontend Developer  
**Timeline**: 2-3 days  
**Critical**: Keep function signatures identical!

---

### Task 1.6: Environment Configuration
- [ ] Set `NEXT_PUBLIC_API_URL` in `.env.local`
- [ ] Configure backend `CORS_ORIGIN` for frontend URL
- [ ] Set JWT secret on backend
- [ ] Set database connection string on backend
- [ ] Test with production-like settings

**Owner**: DevOps/Backend Lead  
**Timeline**: 1 day  
**Files to create**: `.env.local` in frontend root

---

### Task 1.7: Integration Testing
- [ ] Test user registration flow
- [ ] Test product search
- [ ] Test add to basket flow
- [ ] Test checkout and order creation
- [ ] Test tenant accepting order
- [ ] Test customer viewing order status
- [ ] Test admin managing categories
- [ ] Test all role-based access controls

**Owner**: QA/Frontend Developer  
**Timeline**: 2 days  
**When**: After tasks 1.1-1.5 complete

---

## Phase 2: Logging System 🔧

### Task 2.1: Frontend Logging Setup
- [ ] Create `frontend/lib/logger.ts`
- [ ] Export: `logInfo()`, `logError()`, `logDebug()`, `logWarn()`
- [ ] Environment-aware: verbose in dev, silent in prod
- [ ] Send errors to Sentry (if using)

**Owner**: Frontend Developer  
**Timeline**: 1 day  
**Implementation**:
```typescript
// frontend/lib/logger.ts
export const logInfo = (msg: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[INFO] ${msg}`, data);
  }
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Send to Sentry
  }
};

export const logError = (msg: string, error: any) => {
  console.error(`[ERROR] ${msg}`, error);
  // Send to Sentry
};
```

---

### Task 2.2: Backend Logging Setup
- [ ] Install Winston: `npm install winston winston-daily-rotate-file`
- [ ] Create `services/iam/config/logger.js`
- [ ] Create `services/monolith/config/logger.js`
- [ ] Log all API requests (method, endpoint, duration)
- [ ] Log all errors with stack trace
- [ ] Rotate logs daily (keep 30 days)

**Owner**: Backend Developer  
**Timeline**: 1-2 days  
**Implementation**:
```javascript
// services/iam/config/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '30d',
    }),
    new winston.transports.Console(),
  ],
});

module.exports = logger;
```

---

### Task 2.3: Request/Response Logging Middleware
- [ ] Backend: Log all API requests with user_id, endpoint, method
- [ ] Backend: Log all API responses with status code, duration
- [ ] Backend: Log all database queries (if needed)
- [ ] Frontend: Log all API calls in fetch clients
- [ ] Frontend: Log all errors from API calls

**Owner**: Backend + Frontend  
**Timeline**: 1 day  
**Middleware example**:
```javascript
// Backend: Log incoming requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Frontend: Log API calls
fetch(`${API_BASE}/api/products`)
  .then(res => {
    logInfo(`API: GET /api/products ${res.status}`);
    return res.json();
  })
  .catch(err => logError('Failed to fetch products', err));
```

---

### Task 2.4: Error Logging (Production)
- [ ] Set up Sentry for frontend error tracking
- [ ] Set up Sentry for backend error tracking
- [ ] Configure error alerts (email/Slack)
- [ ] Configure performance monitoring

**Owner**: DevOps  
**Timeline**: 1-2 days  
**Optional**: Can do after launch

---

## Phase 3: Database Connection & Deployment 🚀

### Task 3.1: Database Setup
- [ ] Choose database (PostgreSQL/MySQL/MongoDB recommended)
- [ ] Create production database
- [ ] Run migrations (if using migration tool)
- [ ] Seed initial data (categories, units, admin account)
- [ ] Backup strategy

**Owner**: DevOps/Backend Lead  
**Timeline**: 1-2 days

---

### Task 3.2: Backend Deployment
- [ ] Set up hosting (Docker, EC2, Railway, etc)
- [ ] Build Docker image for IAM service
- [ ] Build Docker image for Monolith service
- [ ] Configure environment variables
- [ ] Set up automatic restarts
- [ ] Configure health checks

**Owner**: DevOps  
**Timeline**: 2-3 days

---

### Task 3.3: Frontend Build & Deployment
- [ ] Run `npm run build` and fix any errors
- [ ] Set up hosting (Vercel, Netlify, etc)
- [ ] Configure `NEXT_PUBLIC_API_URL` environment variable
- [ ] Set up domain/SSL
- [ ] Configure automatic deployments

**Owner**: DevOps/Frontend  
**Timeline**: 1-2 days

---

### Task 3.4: End-to-End Testing
- [ ] Test all user flows on production
- [ ] Test search functionality
- [ ] Test order creation and acceptance
- [ ] Test payment flow (if applicable)
- [ ] Monitor logs for errors

**Owner**: QA  
**Timeline**: 2-3 days

---

## Phase 4: Optional Enhancements 💡

### Task 4.1: Payment Integration
- [ ] Integrate Stripe/PayPal
- [ ] Create payment controller
- [ ] Update purchase order to include payment status
- [ ] Add payment confirmation email

**Owner**: Backend Developer  
**Timeline**: 3-5 days  
**Priority**: Low (can do after launch)

---

### Task 4.2: Email Notifications
- [ ] Send order confirmation to customer
- [ ] Send order notification to tenant
- [ ] Send order status updates to customer
- [ ] Send category approval notifications

**Owner**: Backend Developer  
**Timeline**: 2-3 days  
**Tool**: SendGrid or AWS SES

---

### Task 4.3: Advanced Search
- [ ] Add filtering by price range
- [ ] Add filtering by location
- [ ] Add filtering by tenant rating
- [ ] Add sorting options

**Owner**: Frontend Developer  
**Timeline**: 2-3 days  
**Priority**: Low (can do after launch)

---

### Task 4.4: Performance Optimization
- [ ] Add caching (Redis)
- [ ] Optimize database queries (indexes)
- [ ] Compress images
- [ ] Lazy load components
- [ ] Monitor performance metrics

**Owner**: DevOps/Backend  
**Timeline**: 3-5 days  
**Priority**: Low (do after launch)

---

## Timeline Summary

```
Week 1:
  ✓ Phase 1.1: API design
  ✓ Phase 1.3: Database schema
  ✓ Phase 2.1-2: Logging setup

Week 2:
  ✓ Phase 1.2: Backend implementation
  ✓ Phase 1.4-5: Frontend integration
  ✓ Phase 1.7: Testing

Week 3:
  ✓ Phase 3.1-3: Deployment
  ✓ Phase 3.4: E2E testing
  ✓ Launch! 🎉

Optional (After Launch):
  ✓ Phase 4: Enhancements
```

---

## Critical Path (Must Do First)

1. **Backend API endpoints** (1.1, 1.2, 1.3)
2. **Frontend fetch clients** (1.4)
3. **Domain layer migration** (1.5)
4. **Integration testing** (1.7)
5. **Deployment** (3.1, 3.2, 3.3)

Everything else can wait.

---

## Daily Standup Questions

- [ ] Is API design finalized?
- [ ] Are backend endpoints implemented?
- [ ] Did frontend integration start?
- [ ] Are there any blockers?
- [ ] What's the deployment timeline?

---

## Definitions of Done

### Backend Integration Complete
- [ ] All 16+ endpoints working
- [ ] API returns data matching `frontend/structure/db.ts`
- [ ] JWT authentication working
- [ ] CORS headers configured
- [ ] All endpoints tested with Postman

### Frontend Integration Complete
- [ ] All `fetch/*.ts` clients created
- [ ] All `lib/domain/*.ts` updated
- [ ] No TypeScript errors
- [ ] All features tested with real data
- [ ] No console errors

### Logging Complete
- [ ] Frontend logs all errors
- [ ] Backend logs all requests
- [ ] Logs rotate daily
- [ ] Error alerts configured

### Deployment Complete
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Database connected
- [ ] SSL certificates configured
- [ ] Monitoring/alerts set up

---

**Track progress here. Update as tasks complete. Celebrate when Phase 1 is done! 🎉**
