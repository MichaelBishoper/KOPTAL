const path = require('path');
const fs = require('fs');

// Set a safe local upload directory before importing the Express app
const testUploadsDir = path.resolve(__dirname, 'uploads_test');
process.env.UPLOAD_DIR = testUploadsDir;

const request = require('supertest');
const sinon = require('sinon');
const app = require('../src/index.js');
const pool = require('../src/config/db');

describe('File Upload Service API', () => {
  let expect;
  let queryStub;
  let existsSyncStub;
  const tempFilePath = path.resolve(__dirname, 'temp_test_file.txt');

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;

    // Ensure test directories exist
    fs.mkdirSync(testUploadsDir, { recursive: true });
    fs.writeFileSync(tempFilePath, 'temporary file content for unit testing');
  });

  after(() => {
    // Cleanup files
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (fs.existsSync(testUploadsDir)) {
      fs.rmSync(testUploadsDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    queryStub = sinon.stub(pool, 'query');
    
    // Stub fs.existsSync with fallback
    const originalExistsSync = fs.existsSync;
    existsSyncStub = sinon.stub(fs, 'existsSync').callsFake((filePath) => {
      if (filePath === '/missing/file.png') {
        return false;
      }
      if (filePath === tempFilePath) {
        return true;
      }
      return originalExistsSync(filePath);
    });
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

    it('should return 404 if file exists in DB but is physically missing on disk', async () => {
      queryStub.resolves({
        rows: [{ file_path: '/missing/file.png', mime_type: 'image/png' }]
      });

      const res = await request(app).get('/files/123');
      expect(res.status).to.equal(404);
      
      const body = JSON.parse(res.body.toString());
      expect(body.error).to.contain('File not found on disk');
    });

    it('should successfully serve the file if it exists on disk', async () => {
      queryStub.resolves({
        rows: [{ file_path: tempFilePath, mime_type: 'text/plain' }]
      });

      const res = await request(app).get('/files/123');
      expect(res.status).to.equal(200);
      expect(res.headers['content-type']).to.include('text/plain');
      expect(res.text).to.equal('temporary file content for unit testing');
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

    it('should return 400 if file is provided but entity_type or entity_id is missing', async () => {
      const res = await request(app)
        .post('/upload')
        .attach('file', Buffer.from('dummy data'), 'test.txt')
        .field('entity_id', '1'); // missing entity_type

      expect(res.status).to.equal(400);
      expect(res.body.error).to.contain('entity_type and entity_id are required');
    });

    it('should return 500 database insert failed if DB insert rejects', async () => {
      queryStub.rejects(new Error('DB insertion failed'));

      const res = await request(app)
        .post('/upload')
        .attach('file', Buffer.from('dummy data'), 'test.txt')
        .field('entity_type', 'tenant')
        .field('entity_id', '123');

      expect(res.status).to.equal(500);
      expect(res.body.error).to.contain('Database insert failed');
    });

    it('should successfully upload and return file details', async () => {
      const mockResultRow = {
        file_id: 88,
        entity_type: 'product',
        entity_id: 10,
        file_name: 'test.txt',
        file_path: '/some/path/to/test.txt',
        mime_type: 'text/plain',
        file_size: 10
      };
      queryStub.resolves({ rows: [mockResultRow] });

      const res = await request(app)
        .post('/upload')
        .attach('file', Buffer.from('dummy data'), 'test.txt')
        .field('entity_type', 'product')
        .field('entity_id', '10');

      expect(res.status).to.equal(200);
      expect(res.body.file_id).to.equal(88);
      expect(res.body.url).to.include('/files/88');
    });
  });
});
