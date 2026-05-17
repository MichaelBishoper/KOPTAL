const request = require('supertest');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const app = require('../index.js');
const pool = require('../src/config/db');
const PO = require('../src/dao/purchaseOrdersDao');
const LineItem = require('../src/dao/lineItemsDao');

process.env.JWT_SECRET = 'some_test_secret';

describe('Order Service API', () => {
  let expect;
  let queryStub;
  let poCreateStub;
  let poGetStub;
  let poGetByCustomerStub;
  let poGetByTenantStub;
  let poUpdateStatusStub;
  let lineGetStub;
  let lineRestockStub;

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
    poCreateStub = sinon.stub(PO, 'createPurchaseOrder');
    poGetStub = sinon.stub(PO, 'getPurchaseOrderById');
    poGetByCustomerStub = sinon.stub(PO, 'getPurchaseOrdersByCustomer');
    poGetByTenantStub = sinon.stub(PO, 'getPurchaseOrdersByTenant');
    poUpdateStatusStub = sinon.stub(PO, 'updateOrderStatus');
    lineGetStub = sinon.stub(LineItem, 'getLineItemsByOrderId');
    lineRestockStub = sinon.stub(LineItem, 'restockLineItemsByOrderId');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('ok', true);
    });
  });

  describe('GET /api/purchaseOrders/:id - Authentication check', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/purchaseOrders/1');
      expect(res.status).to.equal(401);
    });
  });

  describe('POST /api/purchaseOrders', () => {
    it('should return 403 if user is not a customer', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'tenant' }, 'some_test_secret');
      const res = await request(app)
        .post('/api/purchaseOrders')
        .set('Authorization', `Bearer ${token}`)
        .send({ tenant_id: 10, shipping_address: 'Address' });
      expect(res.status).to.equal(403);
    });

    it('should successfully create order if user is customer', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poCreateStub.resolves({ po_id: 1, po_number: 'PO-1234', customer_id: 5, tenant_id: 10 });

      const res = await request(app)
        .post('/api/purchaseOrders')
        .set('Authorization', `Bearer ${token}`)
        .send({ tenant_id: 10, shipping_address: 'Address' });

      expect(res.status).to.equal(201);
      expect(res.body.po_number).to.equal('PO-1234');
      expect(poCreateStub.calledOnce).to.be.true;
    });
  });

  describe('GET /api/purchaseOrders/my-orders', () => {
    it('should return 403 if user is not customer', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'tenant' }, 'some_test_secret');
      const res = await request(app)
        .get('/api/purchaseOrders/my-orders')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(403);
    });

    it('should return 200 with customer orders', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetByCustomerStub.resolves([{ po_id: 1, po_number: 'PO-1' }]);

      const res = await request(app)
        .get('/api/purchaseOrders/my-orders')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0].po_number).to.equal('PO-1');
    });
  });

  describe('GET /api/purchaseOrders/tenant-orders', () => {
    it('should return 403 if user is not tenant', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'customer' }, 'some_test_secret');
      const res = await request(app)
        .get('/api/purchaseOrders/tenant-orders')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(403);
    });

    it('should return 200 with incoming tenant orders', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant' }, 'some_test_secret');
      poGetByTenantStub.resolves([{ po_id: 1, po_number: 'PO-1' }]);

      const res = await request(app)
        .get('/api/purchaseOrders/tenant-orders')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('GET /api/purchaseOrders/:id', () => {
    it('should return 404 if PO not found', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetStub.resolves(null);

      const res = await request(app)
        .get('/api/purchaseOrders/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(404);
    });

    it('should return 403 if customer A attempts to fetch customer B\'s order', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 99, tenant_id: 10 }); // belongs to customer 99

      const res = await request(app)
        .get('/api/purchaseOrders/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(403);
    });

    it('should return 403 if tenant X attempts to fetch tenant Y\'s order', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 88 }); // belongs to tenant 88

      const res = await request(app)
        .get('/api/purchaseOrders/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(403);
    });

    it('should return 200 with order and line items for authorized user', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10 });
      lineGetStub.resolves([{ product_id: 1, quantity: 2 }]);

      const res = await request(app)
        .get('/api/purchaseOrders/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body.po_id).to.equal(1);
      expect(res.body.items).to.be.an('array');
    });
  });

  describe('PUT /api/purchaseOrders/:id/status', () => {
    it('should return 400 if status parameter is missing', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'draft' });

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).to.equal(400);
    });

    it('should return 403 if tenant attempts to modify status of another tenant\'s order', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 99, status: 'draft' }); // belongs to tenant 99

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'confirmed' });
      expect(res.status).to.equal(403);
    });

    it('should return 400 if tenant sets status to something other than shipped, confirmed, or cancelled', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'draft' });

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'delivered' }); // Delivered is customer-only
      expect(res.status).to.equal(400);
    });

    it('should return 400 if tenant attempts to update status of a delivered order', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'delivered' });

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'cancelled' });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if tenant attempts to update status of an already cancelled order', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'cancelled' });

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'confirmed' });
      expect(res.status).to.equal(400);
    });

    it('should restock products in inventory when a tenant cancels an order', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'confirmed' });
      poUpdateStatusStub.resolves({ po_id: 1, status: 'cancelled' });
      lineRestockStub.resolves();

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'cancelled' });

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('cancelled');
      expect(lineRestockStub.calledOnce).to.be.true;
    });

    it('should return 403 if customer attempts to update status of another customer\'s order', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 99, tenant_id: 10, status: 'shipped' }); // customer 99

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'delivered' });
      expect(res.status).to.equal(403);
    });

    it('should return 400 if customer updates status to something other than delivered', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'shipped' });

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'shipped' }); // customer can only set delivered
      expect(res.status).to.equal(400);
    });

    it('should return 400 if customer attempts to mark a cancelled order as delivered', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'cancelled' });

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'delivered' });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if customer attempts to mark an already delivered order as delivered', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'delivered' });

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'delivered' });
      expect(res.status).to.equal(400);
    });

    it('should successfully update status to delivered when customer confirms delivery', async () => {
      const token = jwt.sign({ user_id: 5, user_type: 'customer' }, 'some_test_secret');
      poGetStub.resolves({ po_id: 1, customer_id: 5, tenant_id: 10, status: 'shipped' });
      poUpdateStatusStub.resolves({ po_id: 1, status: 'delivered' });

      const res = await request(app)
        .put('/api/purchaseOrders/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'delivered' });

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('delivered');
      expect(poUpdateStatusStub.calledOnce).to.be.true;
    });
  });
});
