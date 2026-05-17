const request = require('supertest');
const sinon = require('sinon');
const app = require('../src/index.js');
const pool = require('../src/config/db');

describe('File Upload Service API', () => {
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
      expect(res.text).to.equal('OK');
    });
  });

  describe('GET /files/:file_id', () => {
    it('should return 404 for an unknown file ID', async () => {
      queryStub.resolves({ rows: [] });

      const res = await request(app).get('/files/999999');
      expect(queryStub.calledOnce).to.be.true;
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error', 'File not found');
    });

    it('should handle DB errors gracefully with 500', async () => {
      queryStub.rejects(new Error('DB Error'));

      const res = await request(app).get('/files/1');
      expect(res.status).to.equal(500);
      expect(res.body).to.have.property('error', 'Server error');
    });
  });

  describe('POST /upload', () => {
    it('should return 400 when no file is uploaded', async () => {
      const res = await request(app)
        .post('/upload')
        .field('entity_type', 'tenant')
        .field('entity_id', '1');
        
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'No file uploaded');
    });
  });
});
