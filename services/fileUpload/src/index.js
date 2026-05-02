require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();

// upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'src/uploads/';

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ storage });

// health check
app.get('/health', (req, res) => {
  res.send('OK');
});

// upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  const { entity_type, entity_id } = req.body;

  if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'entity_type and entity_id are required' });
    }
    // insert to db
    const result = await pool.query(
      `INSERT INTO uploaded_files 
      (entity_type, entity_id, file_name, file_path, mime_type, file_size)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        entity_type,
        Number(entity_id),
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size
      ]
    );

    const file = result.rows[0];

    res.json({
      ...file,
      url: `${process.env.BASE_URL}/files/${file.file_id}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// GET Route
app.get('/files/:file_id', async (req, res) => {
  try {
    const { file_id } = req.params;

    // get file from DB
    const result = await pool.query(
      'SELECT file_path, mime_type FROM uploaded_files WHERE file_id = $1',
      [Number(file_id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];

    console.log('Serving file from:', file.file_path);

    res.setHeader('Content-Type', file.mime_type);

    res.sendFile(file.file_path, (err) => {
      if (err) {
        console.error('SendFile error:', err);
        res.status(404).json({ error: 'File not found on disk' });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => {
  console.log('fileUpload service running on port 3000');
});