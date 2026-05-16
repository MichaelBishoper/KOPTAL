-- units
CREATE TABLE units (
    unit_id SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) UNIQUE NOT NULL, 
    unit_symbol VARCHAR(10) UNIQUE NOT NULL, 
    unit_type VARCHAR(50)          
);

-- tenants
CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- customers
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255) NOT NULL,
    tax_id VARCHAR(255) NOT NULL,
    billing_address TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admins
CREATE TABLE admins (
    manager_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    categories TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- products
CREATE TABLE tenant_products (
    product_id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(255) UNIQUE NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_id INT NOT NULL REFERENCES units(unit_id),
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500),
    description TEXT
);

-- purchase_orders
CREATE TABLE purchase_orders (
    po_id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    tenant_id INT NOT NULL REFERENCES tenants(tenant_id),
    status VARCHAR(50) DEFAULT 'draft' 
        CHECK (status IN ('draft', 'submitted', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipping_address TEXT NOT NULL,
    notes TEXT,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0
);

-- po_line_items
CREATE TABLE po_line_items (
    po_item_id SERIAL PRIMARY KEY,
    po_id INT NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES tenant_products(product_id),
    quantity DECIMAL(12, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- uploaded_files
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

-- Insert Units
INSERT INTO units (unit_name, unit_symbol, unit_type) VALUES
('grams', 'g', 'weight'),
('pieces', 'pc', 'count');

-- Insert Tenants
INSERT INTO tenants (name, email, phone, verified, password_hash, location, image_url) VALUES
('Rafael Fresh Foods', 'rafael@marketplace.com', '555-0101', true, '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe', '123 Harvest Road, Jakarta', 'https://images.example.com/rafael.jpg');

-- Insert Customers
INSERT INTO customers (name, email, phone, company, tax_id, billing_address, shipping_address, password_hash) VALUES
('James Carter', 'james@kraftykitchen.com', '555-0201', 'Krafty Kitchen Inc', 'TX-12345678', '100 Corporate Dr, Chicago, IL 60601', '100 Corporate Dr, Chicago, IL 60601', '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe');

-- Insert Admins
INSERT INTO admins (name, email, phone, password_hash, categories) VALUES
('Alice Manager', 'alice@marketplace.com', '555-0301', '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe', ARRAY['Vegetables', 'Fruits', 'Spices']);

-- Insert Tenant Products
INSERT INTO tenant_products (tenant_id, name, quantity, unit_id, price, category, image_url, description) VALUES
(1, 'Organic Potatoes', 5000, 1, 0.45, 'Vegetables', 'https://images.example.com/potatoes.jpg', 'Fresh organic potatoes for daily use'),
(1, 'Organic Apples', 1200, 2, 1.10, 'Fruits', 'https://images.example.com/apples.jpg', 'Crisp apples sold by the piece'),
(1, 'Black Pepper', 800, 1, 2.25, 'Spices', 'https://images.example.com/pepper.jpg', 'Aromatic ground black pepper');
