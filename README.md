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
Inside `/services/iam`, create a `.env` file with these values (example):
```
PORT=3000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=password123
PG_DATABASE=koptal
JWT_SECRET=some_test_secret
```

### Running service locally
```
cd services/iam
npm install
node server.js
```

### API Endpoints
#### Public Routes
**POST /api/auth/register**

Json Body:
```json
{
    "user_type": "tenant",
    "name": "Jethro Tolol",
    "email": "jethro.email",
    "phone": "67",
    "password": "password"
}
```
Expected Response:
```json
{
    "message": "tenant created successfully"
}
```

**POST /api/auth/login**

Json Body:
```json
{
    "user_type": "tenant",
    "name": "Jethro Tolol",
    "email": "jethro.email",
    "phone": "67",
    "password": "password"
}
```
Expected Response:
```json
{
    "token": "secret_token",
    "user_type": "tenant"
}
```

## monolith

inside `/services/monolith`, create a `.env` file with these values (example):
```
PORT=4000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=password123
PG_DATABASE=koptal
JWT_SECRET=some_test_secret
```

### Running service locally
```
cd services/monolith
npm install
node index.js
```

### API endpoints
#### Health check
```
GET /health
```

#### Units
```
GET /api/units
GET /api/units/:id
POST /api/units         # protected (Authorization: Bearer <token>)
PUT /api/units/:id      # protected
DELETE /api/units/:id   # protected
```

POST/PUT body (JSON sample):
```json
{
    "unit_name": "kilogram",
    "unit_symbol": "kg",
    "unit_type": "weight"
}
```

#### Tenant Products
```
GET /api/products
GET /api/products/:id
POST /api/products      # protected (Authorization: Bearer <token>)
PUT /api/products/:id   # protected
DELETE /api/products/:id# protected
```

POST/PUT body (JSON sample):
```json
{
    "tenant_id": 1,
    "name": "Organic Spinach",
    "quantity": 1200,
    "unit_id": 1,
    "price": 0.95
}
```

Token generation examples (PowerShell, run from `services/monolith`):
```
node -e "require('dotenv').config(); const jwt=require('jsonwebtoken'); console.log(jwt.sign({ tenant_id: 1 }, process.env.JWT_SECRET));"

node -e "require('dotenv').config(); const jwt=require('jsonwebtoken'); console.log(jwt.sign({ manager_id: 10, role: 'admin' }, process.env.JWT_SECRET));"
```

Notes about auth and tenant scoping:
- The service uses JWT tokens verified with `JWT_SECRET` from the `.env`.
- For tenant-scoped operations (product create/update/delete) include `tenant_id` in the token payload (e.g. `{ "tenant_id": 1 }`). If the token contains `tenant_id`, the controller enforces that the token's tenant matches the product's tenant. On create, if request body omits `tenant_id` it will be set from the token.
- Admin tokens may omit `tenant_id` and include `role: 'admin'` to perform actions across tenants. You can also include an identity claim like `manager_id` for auditing.

