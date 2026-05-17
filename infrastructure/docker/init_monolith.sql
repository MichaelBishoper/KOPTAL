
-- units
CREATE TABLE units (
    unit_id SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) UNIQUE NOT NULL,
    unit_symbol VARCHAR(10) UNIQUE NOT NULL,
    unit_type VARCHAR(50)
);

-- admin_settings
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    categories TEXT[] NOT NULL DEFAULT '{}',
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 11.00
);

INSERT INTO admin_settings (id, categories, tax_rate) VALUES (1, ARRAY['Vegetables', 'Fruits', 'Spices'], 11.00);

-- products (no FK to tenants — tenant_id is a logical reference to the IAM service)
CREATE TABLE tenant_products (
    product_id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_id INT NOT NULL REFERENCES units(unit_id),
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500),
    description TEXT
);

-- purchase_orders (no FK to customers or tenants — logical references only)
CREATE TABLE purchase_orders (
    po_id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    tenant_id INT NOT NULL,
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

-- Seed data
INSERT INTO units (unit_name, unit_symbol, unit_type) VALUES
('grams', 'g', 'weight'),
('pieces', 'pc', 'count');

INSERT INTO tenant_products (tenant_id, name, quantity, unit_id, price, category, image_url, description) VALUES
(1, 'Organic Potatoes', 5000, 1, 0.45, 'Vegetables', 'https://images.example.com/potatoes.jpg', 'Fresh organic potatoes for daily use'),
(1, 'Organic Apples', 1200, 2, 1.10, 'Fruits', 'https://images.example.com/apples.jpg', 'Crisp apples sold by the piece'),
(1, 'Black Pepper', 800, 1, 2.25, 'Spices', 'https://images.example.com/pepper.jpg', 'Aromatic ground black pepper');
