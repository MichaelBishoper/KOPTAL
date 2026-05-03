# KOPTAL
# Backend Services:
## fileUpload
inside `/services/fileUpload`, create a `.env` file:
```
PORT=3000
UPLOAD_DIR=/app/src/uploads/
DB_HOST=host.docker.internal
DB_NAME=<database name>
DB_USER=<database user>
DB_PASSWORD=<database password>
DB_PORT=5432
BASE_URL=http://localhost:3000
```

### Running service locally
```
npm install
npm run dev
```

### Running service on Docker
build image
```
docker build -t fileupload-service .
```
run the container
```
docker run -p 3000:3000 --env-file .env fileupload-service
```

### API endpoints
#### Health check
```
GET /health
```

#### Upload file
```
POST /upload
```
Body (form-data):

| Key          | Type | Description |
|-------------|------|------------|
| file        | File | Image file to upload |
| entity_type | Text | Type of entity (e.g. product, user) |
| entity_id   | Text | ID of the entity |

##### Example
| Key          | Type | Value |
|-------------|------|------|
| file        | File | image.png |
| entity_type | Text | product |
| entity_id   | Text | 1 |

##### Sample Response
```json
{
    "file_id": 6,
    "entity_type": "product",
    "entity_id": 1,
    "file_name": "abno.png",
    "file_path": "/app/src/uploads/62444cf8-5374-4f26-a6d5-4353295ac3fd.png",
    "mime_type": "image/png",
    "file_size": 4006,
    "uploaded_at": "2026-05-03T00:23:52.472Z",
    "url": "http://localhost:3000/files/6"
}
```

#### Get file
```
GET /files/:fileid
```
##### Example 
```
http://localhost:3000/files/6
```

uploaded files are temporarily stored in table uploaded_files
query for postgresql for the table
```
CREATE TABLE uploaded_files (
    file_id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notes

This service currently does NOT validate entity existence. Responsibility is delegated to other microservices.

Files are stored in /app/src/uploads/

## IAM
