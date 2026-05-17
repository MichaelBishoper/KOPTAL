const request = require('supertest');
const sinon = require('sinon');
const app = require('../index.js');
const pool = require('../src/config/db');

describe('Adminconf Service API', () => {
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

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('ok', true);
    });
  });

  describe('GET /api/admin/settings', () => {
    it('should return 200 and settings', async () => {
      queryStub.resolves({ rows: [{ categories: ['Food'], tax_rate: 10.0 }] });
      const res = await request(app).get('/api/admin/settings');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
    });
  });
});
