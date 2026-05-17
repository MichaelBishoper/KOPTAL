const request = require('supertest');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const app = require('../index.js');
const pool = require('../src/config/db');
const Products = require('../src/dao/tenantProductsDao');

process.env.JWT_SECRET = 'some_test_secret';

describe('Inventory Service API', () => {
  let expect;
  let queryStub;
  let getAllStub;
  let getByIdStub;
  let createStub;
  let updateStub;
  let deleteStub;
  let decrementStub;
  let incrementStub;

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
    getAllStub = sinon.stub(Products, 'getAllProducts');
    getByIdStub = sinon.stub(Products, 'getProductById');
    createStub = sinon.stub(Products, 'createProduct');
    updateStub = sinon.stub(Products, 'updateProduct');
    deleteStub = sinon.stub(Products, 'deleteProduct');
    decrementStub = sinon.stub(Products, 'decrementStock');
    incrementStub = sinon.stub(Products, 'incrementStock');
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

  describe('GET /api/products', () => {
    it('should return 200 with list of products and update local cache', async () => {
      getAllStub.resolves([{ id: 1, name: 'Laptop', price: 999.99 }]);
      const res = await request(app).get('/api/products');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data[0].name).to.equal('Laptop');
    });

    it('should fallback gracefully to cache when database query fails', async () => {
      // First populate the cache
      getAllStub.resolves([{ id: 1, name: 'Cached Laptop', price: 999.99 }]);
      await request(app).get('/api/products');

      // Next call database fails
      getAllStub.rejects(new Error('DB connection failure'));
      const res = await request(app).get('/api/products');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data[0].name).to.equal('Cached Laptop');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 if product is not found', async () => {
      getByIdStub.resolves(null);
      const res = await request(app).get('/api/products/999');
      expect(res.status).to.equal(404);
      expect(res.body.error).to.include('Product not found');
    });

    it('should return 200 with product details', async () => {
      getByIdStub.resolves({ id: 5, name: 'Desk', tenant_id: 10 });
      const res = await request(app).get('/api/products/5');
      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('Desk');
    });
  });

  describe('POST /api/products', () => {
    it('should return 401 if request is unauthenticated', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Chair', price: 50.0 });
      expect(res.status).to.equal(401);
    });

    it('should return 403 if tenant tries to create a product for another tenant_id', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Chair', price: 50.0, tenant_id: 99 }); // mismatched tenant_id
      expect(res.status).to.equal(403);
      expect(res.body.error).to.include('tenant mismatch');
    });

    it('should successfully create product and auto-fill tenant_id if not supplied', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      createStub.resolves({ id: 1, name: 'Chair', tenant_id: 10 });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Chair', price: 50.0 });

      expect(res.status).to.equal(201);
      expect(res.body.data.tenant_id).to.equal(10);
      expect(createStub.calledOnce).to.be.true;
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should return 404 if product does not exist', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      getByIdStub.resolves(null);

      const res = await request(app)
        .put('/api/products/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Chair' });
      expect(res.status).to.equal(404);
    });

    it('should return 403 if tenant tries to update product of another tenant', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      getByIdStub.resolves({ id: 5, name: 'Desk', tenant_id: 99 }); // owned by tenant 99

      const res = await request(app)
        .put('/api/products/5')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Desk' });
      expect(res.status).to.equal(403);
    });

    it('should return 403 if tenant attempts to change tenant_id to a different tenant_id', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      getByIdStub.resolves({ id: 5, name: 'Desk', tenant_id: 10 });

      const res = await request(app)
        .put('/api/products/5')
        .set('Authorization', `Bearer ${token}`)
        .send({ tenant_id: 99 }); // changing tenant ownership
      expect(res.status).to.equal(403);
    });

    it('should successfully update product details', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      getByIdStub.resolves({ id: 5, name: 'Desk', tenant_id: 10 });
      updateStub.resolves({ id: 5, name: 'Super Desk', tenant_id: 10 });

      const res = await request(app)
        .put('/api/products/5')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Super Desk' });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal('Super Desk');
      expect(updateStub.calledOnce).to.be.true;
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should return 404 if product not found', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      getByIdStub.resolves(null);

      const res = await request(app)
        .delete('/api/products/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(404);
    });

    it('should return 403 if tenant attempts to delete another tenant\'s product', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      getByIdStub.resolves({ id: 5, tenant_id: 99 }); // owned by tenant 99

      const res = await request(app)
        .delete('/api/products/5')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(403);
    });

    it('should successfully delete product', async () => {
      const token = jwt.sign({ user_id: 10, user_type: 'tenant', tenant_id: 10 }, 'some_test_secret');
      getByIdStub.resolves({ id: 5, tenant_id: 10 });
      deleteStub.resolves();

      const res = await request(app)
        .delete('/api/products/5')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Deleted');
      expect(deleteStub.calledOnce).to.be.true;
    });
  });

  describe('PUT /api/products/:id/decrement', () => {
    it('should return 400 if quantity is invalid', async () => {
      const res = await request(app)
        .put('/api/products/5/decrement')
        .send({ quantity: -5 });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if decrement is not possible (insufficient stock or not found)', async () => {
      decrementStub.resolves(null);
      const res = await request(app)
        .put('/api/products/5/decrement')
        .send({ quantity: 10 });
      expect(res.status).to.equal(400);
    });

    it('should successfully decrement stock and return updated product details', async () => {
      decrementStub.resolves({ id: 5, quantity: 20 });
      const res = await request(app)
        .put('/api/products/5/decrement')
        .send({ quantity: 5 });
      expect(res.status).to.equal(200);
      expect(res.body.data.quantity).to.equal(20);
    });
  });

  describe('PUT /api/products/:id/increment', () => {
    it('should return 400 if quantity is invalid', async () => {
      const res = await request(app)
        .put('/api/products/5/increment')
        .send({ quantity: 'lots' });
      expect(res.status).to.equal(400);
    });

    it('should return 404 if product not found', async () => {
      incrementStub.resolves(null);
      const res = await request(app)
        .put('/api/products/999/increment')
        .send({ quantity: 10 });
      expect(res.status).to.equal(404);
    });

    it('should successfully increment stock and return updated product details', async () => {
      incrementStub.resolves({ id: 5, quantity: 50 });
      const res = await request(app)
        .put('/api/products/5/increment')
        .send({ quantity: 15 });
      expect(res.status).to.equal(200);
      expect(res.body.data.quantity).to.equal(50);
    });
  });
});
