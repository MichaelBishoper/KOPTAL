const request = require('supertest');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const app = require('../index.js');
const pool = require('../src/config/db');

process.env.JWT_SECRET = 'some_test_secret';

describe('Adminconf Service API', () => {
  let expect;
  let queryStub;
  let fetchStub;

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
    fetchStub = sinon.stub(global, 'fetch');
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

  describe('GET /api/admin/settings', () => {
    it('should retrieve settings and successfully merge categories from remote inventory service', async () => {
      queryStub.resolves({
        rows: [{ categories: ['Food', 'Drinks'], tax_rate: 10.5 }]
      });

      fetchStub.resolves({
        ok: true,
        json: async () => ({
          success: true,
          data: [{ category: 'Electronics' }, { category: 'Food' }, { category: '   ' }, { category: null }]
        })
      });

      const res = await request(app).get('/api/admin/settings');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      
      const data = res.body.data;
      expect(data.tax_rate).to.equal(10.5);
      // Merged categories should unique-fy: Food, Drinks, Electronics (empty / null filtered out)
      expect(data.categories).to.include.members(['Food', 'Drinks', 'Electronics']);
      expect(data.categories).to.not.include('');
      expect(fetchStub.calledOnce).to.be.true;
    });

    it('should fallback gracefully to DB-only categories when fetch fails (rejects)', async () => {
      queryStub.resolves({
        rows: [{ categories: ['Office Supplies'], tax_rate: 11.0 }]
      });
      fetchStub.rejects(new Error('Network error connecting to Inventory service'));

      const res = await request(app).get('/api/admin/settings');
      expect(res.status).to.equal(200);
      expect(res.body.data.categories).to.deep.equal(['Office Supplies']);
    });

    it('should fallback gracefully to DB-only categories when fetch returns non-2xx status', async () => {
      queryStub.resolves({
        rows: [{ categories: ['Books'], tax_rate: 12.0 }]
      });
      fetchStub.resolves({
        ok: false,
        status: 500
      });

      const res = await request(app).get('/api/admin/settings');
      expect(res.status).to.equal(200);
      expect(res.body.data.categories).to.deep.equal(['Books']);
    });
  });

  describe('PUT /api/admin/settings', () => {
    it('should return 401 if request is unauthenticated', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .send({ tax_rate: 12.5 });
      expect(res.status).to.equal(401);
    });

    it('should return 403 if authenticated user is not an admin', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'tenant' }, 'some_test_secret');
      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ tax_rate: 12.5 });
      expect(res.status).to.equal(403);
    });

    it('should return 200 and successfully update categories and tax rate when request is from admin', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'admin' }, 'some_test_secret');
      queryStub.resolves({ rows: [] });

      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ categories: ['Furniture', 'Hardware'], tax_rate: 15.0 });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.tax_rate).to.equal(15.0);
      expect(res.body.data.categories).to.deep.equal(['Furniture', 'Hardware']);
      
      // Verification that both DB updates occurred
      expect(queryStub.calledTwice).to.be.true;
    });

    it('should ignore non-numeric or non-finite tax rates and arrays with invalid categories', async () => {
      const token = jwt.sign({ user_id: 1, user_type: 'admin' }, 'some_test_secret');
      queryStub.resolves({ rows: [] });

      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ categories: 'not-an-array', tax_rate: NaN }); // invalid payload

      expect(res.status).to.equal(200);
      // DB queries should not be run since input is invalid
      expect(queryStub.called).to.be.false;
    });
  });
});
