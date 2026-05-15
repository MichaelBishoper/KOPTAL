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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admins
CREATE TABLE admins (
    manager_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
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
('pound', 'lbs', 'weight'),
('bushel', 'bu', 'volume'),
('gallon', 'gal', 'volume'),
('ton', 't', 'weight'),
('kilogram', 'kg', 'weight'),
('each', 'ea', 'count');

-- Insert Tenants
INSERT INTO tenants (name, email, phone, verified, password_hash, location, image_url) VALUES
('Green Valley Farms', 'contact@greenvalley.com', '555-0101', true, '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe', '123 Farm Road, Iowa City, IA', 'https://images.example.com/greenvalley.jpg'),
('Midwest Grain Co-op', 'orders@midwestgrain.com', '555-0102', true, '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe', '456 Grain Ave, Omaha, NE', 'https://images.example.com/midwestgrain.jpg'),
('Sunset Orchards', 'sales@sunsetorchards.com', '555-0103', false, '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe', '789 Orchard Lane, Yakima, WA', 'https://images.example.com/sunsetorchards.jpg'),
('Prairie Meats', 'info@prairiemeats.com', '555-0104', true, '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe', '321 Ranch Road, Kansas City, KS', 'https://images.example.com/prairiemeats.jpg');

-- Insert Customers
INSERT INTO customers (name, email, phone, company, tax_id, billing_address, shipping_address, password_hash) VALUES
('John Smith', 'john.smith@kraftykitchen.com', '555-0201', 'Krafty Kitchen Inc', 'TX-12345678', '100 Corporate Dr, Chicago, IL 60601', '100 Corporate Dr, Chicago, IL 60601', '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe'),
('Maria Garcia', 'maria@freshbites.com', '555-0202', 'Fresh Bites LLC', 'CA-87654321', '200 Market St, San Francisco, CA 94103', '200 Market St, San Francisco, CA 94103', '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe'),
('David Chen', 'david@premiumpetfoods.com', '555-0203', 'Premium Pet Foods', 'TX-99887766', '300 Industrial Pkwy, Dallas, TX 75201', '300 Industrial Pkwy, Dallas, TX 75201', '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe'),
('Sarah Jones', 'sarah@heartlandbakery.com', '555-0204', 'Heartland Bakery', 'IL-44556677', '400 Main St, Springfield, IL 62701', '400 Main St, Springfield, IL 62701', '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe');

-- Insert Admins
INSERT INTO admins (name, email, phone, password_hash, categories) VALUES
('Alice Manager', 'alice@marketplace.com', '555-0301', '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe', ARRAY['farming', 'organic', 'grains']),
('Bob Admin', 'bob@marketplace.com', '555-0302', '$2b$10$xk7zXKxQYKKbRk9xYqZ9Oe', ARRAY['livestock', 'dairy', 'meat']);

-- Insert Tenant Products
INSERT INTO tenant_products (tenant_id, name, quantity, unit_id, price, category, image_url, description) VALUES
(1, 'Organic Russet Potatoes', 50000, 1, 0.45, 'vegetables', 'https://images.example.com/potatoes.jpg', 'Premium organic russet potatoes, ideal for baking and frying'),
(1, 'Organic Carrots', 25000, 1, 0.65, 'vegetables', 'https://images.example.com/carrots.jpg', 'Sweet organic carrots, perfect for juicing or cooking'),
(1, 'Organic Onions', 30000, 1, 0.55, 'vegetables', 'https://images.example.com/onions.jpg', 'Fresh organic yellow onions'),
(2, 'Yellow Corn #2', 150000, 2, 4.25, 'grains', 'https://images.example.com/corn.jpg', 'Feed-grade yellow corn for livestock'),
(2, 'Soybeans', 75000, 2, 10.50, 'grains', 'https://images.example.com/soybeans.jpg', 'Non-GMO soybeans for oil extraction'),
(2, 'Hard Red Winter Wheat', 100000, 2, 5.75, 'grains', 'https://images.example.com/wheat.jpg', 'High protein wheat for bread flour'),
(3, 'Gala Apples', 10000, 1, 0.85, 'fruit', 'https://images.example.com/gala.jpg', 'Sweet and crisp Gala apples'),
(3, 'Fuji Apples', 8000, 1, 0.95, 'fruit', 'https://images.example.com/fuji.jpg', 'Extra sweet Fuji apples'),
(4, 'Ground Beef 80/20', 20000, 1, 3.50, 'meat', 'https://images.example.com/groundbeef.jpg', 'Premium ground beef, 80% lean 20% fat'),
(4, 'Chicken Breast', 15000, 1, 2.75, 'poultry', 'https://images.example.com/chicken.jpg', 'Boneless skinless chicken breast'),
(4, 'Pork Shoulder', 10000, 1, 2.25, 'meat', 'https://images.example.com/pork.jpg', 'Whole pork shoulder for smoking or roasting');

-- Insert Purchase Orders
INSERT INTO purchase_orders (po_number, customer_id, tenant_id, status, shipping_address, notes, subtotal, tax_amount, total_amount) VALUES
('PO-2024-001', 1, 1, 'confirmed', '100 Corporate Dr, Chicago, IL 60601', 'Need delivery by Friday', 775.00, 62.00, 837.00),
('PO-2024-002', 2, 2, 'shipped', '200 Market St, San Francisco, CA 94103', 'For pet food production', 42250.00, 3380.00, 45630.00),
('PO-2024-003', 3, 4, 'draft', '300 Industrial Pkwy, Dallas, TX 75201', NULL, 11125.00, 890.00, 12015.00),
('PO-2024-004', 4, 1, 'submitted', '400 Main St, Springfield, IL 62701', NULL, 1340.00, 107.20, 1447.20),
('PO-2024-005', 1, 4, 'delivered', '100 Corporate Dr, Chicago, IL 60601', 'Rush order', 3525.00, 282.00, 3807.00);

-- Insert PO Line Items
INSERT INTO po_line_items (po_id, product_id, quantity, unit_price) VALUES
(1, 1, 1000, 0.45),
(1, 2, 500, 0.65),
(2, 4, 5000, 4.25),
(2, 5, 2000, 10.50),
(3, 9, 2000, 3.50),  -- 9 corresponds to Ground Beef
(3, 10, 1500, 2.75), -- 10 corresponds to Chicken
(4, 3, 800, 0.55),
(4, 1, 2000, 0.45),
(5, 11, 500, 2.25),
(5, 9, 200, 12.00);
