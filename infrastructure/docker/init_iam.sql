
-- tenants (shops)
CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    image_url VARCHAR(500),
    cooperative_id_number VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- customers
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255) NOT NULL,
    business_id_number VARCHAR(255) NOT NULL,
    corporate_tax_id VARCHAR(255) NOT NULL,
    billing_address TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admins
CREATE TABLE admins (
    manager_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\INSERT INTO tenants (name, email, phone, verified, password_hash, location, image_url, cooperative_id_number) VALUES
('Rafael Fresh Foods', 'rafael@marketplace.com', '555-0101', true, '$2b$10$hbe.nOvtI2fgGyvEr2gwD.Ydn5tqlxrXZm77ejMd.oB5xmjg0Sh8u', '123 Harvest Road, Jakarta', 'https://images.example.com/rafael.jpg', 'COOP-001');

INSERT INTO customers (name, email, phone, company, business_id_number, corporate_tax_id, billing_address, shipping_address, password_hash) VALUES
('James Carter', 'james@kraftykitchen.com', '555-0201', 'Krafty Kitchen Inc', 'NIB-1234567890123', '01.234.567.8-901.234', '100 Corporate Dr, Chicago, IL 60601', '100 Corporate Dr, Chicago, IL 60601', '$2b$10$hbe.nOvtI2fgGyvEr2gwD.Ydn5tqlxrXZm77ejMd.oB5xmjg0Sh8u');

INSERT INTO admins (username, password_hash) VALUES
('admin', '$2b$10$hbe.nOvtI2fgGyvEr2gwD.Ydn5tqlxrXZm77ejMd.oB5xmjg0Sh8u');
