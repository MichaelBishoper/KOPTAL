const request = require('supertest');
const sinon = require('sinon');
const app = require('../server.js');
const pool = require('../db');

describe('IAM Service API', () => {
  let expect;
  let queryStub;

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
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
      queryStub.resolves({ rows: [{ tenant_id: 1, name: 'Test Tenant' }] });
      const res = await request(app).get('/api/public/tenants');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });
});
