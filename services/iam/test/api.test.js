const request = require('supertest');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server.js');
const pool = require('../db');

process.env.JWT_SECRET = 'some_test_secret';

describe('IAM Service API', () => {
  let expect;
  let queryStub;
  let hashStub;
  let compareStub;

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
    hashStub = sinon.stub(bcrypt, 'hash').resolves('mocked_hash');
    compareStub = sinon.stub(bcrypt, 'compare').resolves(true);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /debug', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/debug');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'ok');
    });
  });

  describe('GET /api/public/tenants', () => {
    it('should return 200 and list of tenants', async () => {
      queryStub.resolves({ rows: [{ tenant_id: 1, name: 'Test Tenant', verified: true, location: 'ID', created_at: new Date().toISOString() }] });
      const res = await request(app).get('/api/public/tenants');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('name', 'Test Tenant');
    });

    it('should handle errors gracefully', async () => {
      queryStub.rejects(new Error('Database Error'));
      const res = await request(app).get('/api/public/tenants');
      expect(res.status).to.equal(500);
    });
  });

  describe('GET /api/public/customers', () => {
    it('should return 200 and list of customers', async () => {
      queryStub.resolves({ rows: [{ customer_id: 1, name: 'Test Customer', company: 'Test Co' }] });
      const res = await request(app).get('/api/public/customers');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('name', 'Test Customer');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if user_type is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password', name: 'Test' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Missing registration fields');
    });

    it('should return 400 if email, password, or name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ user_type: 'customer', email: '', password: 'password', name: 'Test' });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if user_type is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ user_type: 'invalid_role', email: 'test@test.com', password: 'password', name: 'Test' });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if registering tenant and location is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ user_type: 'tenant', email: 't@t.com', password: 'password', name: 'Tenant', cooperative_id_number: '123' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Tenant location is required');
    });

    it('should return 400 if registering tenant and cooperative_id_number is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ user_type: 'tenant', email: 't@t.com', password: 'password', name: 'Tenant', location: 'JKT' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Cooperative ID Number is required');
    });

    it('should register a customer successfully', async () => {
      queryStub.resolves({ rows: [{ customer_id: 42 }] });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ user_type: 'customer', email: 'c@c.com', password: 'password', name: 'Customer' });
      expect(res.status).to.equal(201);
      expect(res.body.message).to.include('customer created successfully');
      expect(res.body.id).to.equal(42);
    });

    it('should register a tenant successfully', async () => {
      queryStub.resolves({ rows: [{ tenant_id: 101 }] });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ user_type: 'tenant', email: 't@t.com', password: 'password', name: 'Tenant', location: 'JKT', cooperative_id_number: '123' });
      expect(res.status).to.equal(201);
      expect(res.body.message).to.include('tenant created successfully');
    });

    it('should trigger database timeout (withDbTimeout) and return 503', async () => {
      queryStub.returns(new Promise((resolve) => setTimeout(() => resolve({ rows: [] }), 7000)));
      const res = await request(app)
        .post('/api/auth/register')
        .send({ user_type: 'customer', email: 'c@c.com', password: 'password', name: 'Customer' });
      expect(res.status).to.equal(503);
      expect(res.body.error).to.include('Database unavailable');
    }).timeout(8000);
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if password or user_type is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 't@t.com' });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if user_type is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 't@t.com', password: 'pwd', user_type: 'wrong' });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if tenant login is missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pwd', user_type: 'tenant' });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if customer login is missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pwd', user_type: 'customer' });
      expect(res.status).to.equal(400);
    });

    it('should return 400 if admin login is missing username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pwd', user_type: 'admin' });
      expect(res.status).to.equal(400);
    });

    it('should return 401 if user is not found in database', async () => {
      queryStub.resolves({ rows: [] });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@t.com', password: 'pwd', user_type: 'tenant' });
      expect(res.status).to.equal(401);
    });

    it('should return 401 if password check fails', async () => {
      queryStub.resolves({ rows: [{ tenant_id: 1, password_hash: 'hash' }] });
      compareStub.resolves(false);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 't@t.com', password: 'wrong_pwd', user_type: 'tenant' });
      expect(res.status).to.equal(401);
    });

    it('should login tenant successfully and return JWT', async () => {
      queryStub.resolves({ rows: [{ tenant_id: 1, password_hash: 'hash', name: 'Tenant' }] });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 't@t.com', password: 'password', user_type: 'tenant' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.user_type).to.equal('tenant');
    });

    it('should login customer successfully and return JWT', async () => {
      queryStub.resolves({ rows: [{ customer_id: 1, password_hash: 'hash', name: 'Customer' }] });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'c@c.com', password: 'password', user_type: 'customer' });
      expect(res.status).to.equal(200);
      expect(res.body.user_type).to.equal('customer');
    });

    it('should login admin successfully and return JWT', async () => {
      queryStub.resolves({ rows: [{ manager_id: 1, password_hash: 'hash', username: 'admin' }] });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'password', user_type: 'admin' });
      expect(res.status).to.equal(200);
      expect(res.body.user_type).to.equal('admin');
    });
  });

  describe('POST /api/auth/register-admin', () => {
    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app)
        .post('/api/auth/register-admin')
        .send({ username: 'newadmin', password: 'password' });
      expect(res.status).to.equal(401);
    });

    it('should return 403 if authenticated user is not an admin', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'tenant', email: 't@t.com' }, 'some_test_secret');
      const res = await request(app)
        .post('/api/auth/register-admin')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'newadmin', password: 'password' });
      expect(res.status).to.equal(403);
    });

    it('should return 400 if username or password is missing', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'admin', email: 'admin' }, 'some_test_secret');
      const res = await request(app)
        .post('/api/auth/register-admin')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: '' });
      expect(res.status).to.equal(400);
    });

    it('should successfully create an admin when requested by admin', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'admin', email: 'admin' }, 'some_test_secret');
      queryStub.resolves({ rows: [{ manager_id: 99 }] });
      const res = await request(app)
        .post('/api/auth/register-admin')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'newadmin', password: 'password' });
      expect(res.status).to.equal(201);
      expect(res.body.message).to.include('Admin created successfully');
      expect(res.body.manager_id).to.equal(99);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .send({ currentPassword: 'old', newPassword: 'new' });
      expect(res.status).to.equal(401);
    });

    it('should return 400 if missing currentPassword or newPassword', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'tenant', email: 't@t.com' }, 'some_test_secret');
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'old' });
      expect(res.status).to.equal(400);
    });

    it('should return 404 if user not found in DB', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'tenant', email: 't@t.com' }, 'some_test_secret');
      queryStub.resolves({ rows: [] });
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'old', newPassword: 'new' });
      expect(res.status).to.equal(404);
    });

    it('should return 401 if current password is incorrect', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'tenant', email: 't@t.com' }, 'some_test_secret');
      queryStub.resolves({ rows: [{ tenant_id: 1, password_hash: 'old_hash' }] });
      compareStub.resolves(false);
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'wrong_old', newPassword: 'new' });
      expect(res.status).to.equal(401);
    });

    it('should successfully update password', async () => {
      const token = jwt.sign({ user_id: 12, user_type: 'customer', email: 'c@c.com' }, 'some_test_secret');
      queryStub.onFirstCall().resolves({ rows: [{ customer_id: 12, password_hash: 'old_hash' }] });
      queryStub.onSecondCall().resolves({ rows: [{ customer_id: 12 }] });
      compareStub.resolves(true);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'old', newPassword: 'new' });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('Password updated successfully');
    });
  });
});
