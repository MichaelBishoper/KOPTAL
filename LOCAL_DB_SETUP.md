# Changes
## Admins Table
Old:
```sql
create table admins (
	manager_id serial primary key,
	name varchar(100) unique not null,
	email varchar(255) unique not null,
	phone varchar(255) unique not null,
	password_hash VARCHAR(255) not null,
	created_at TIMESTAMP default current_timestamp
);
```

New:
```sql
CREATE TABLE admins (
    manager_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    categories TEXT[],  -- NEW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
	image_url VARCHAR(500), -- NEW
## Tenants Table
Old:
```sql
create table tenants (
	tenant_id serial primary key,
	name varchar(100) unique not null,
	email varchar(255) unique not null,
	phone varchar(255) unique not null,
	verified boolean default false,
	image_url VARCHAR(500), -- NEW
	password_hash VARCHAR(255) not null,
	created_at TIMESTAMP default current_timestamp
);
```

New:
```sql
CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(255), -- NEW
    image_url VARCHAR(500), -- NEW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
## Products Table
Old:
```sql
create table tenant_products (
		product_id serial primary key,
		tenant_id int not null references tenants(tenant_id) on delete cascade,
		name varchar(255) unique not null,
		quantity decimal(12,2) not null,
		unit_id int not null references units(unit_id),
		price decimal(10,2) not null
);
```

New:
```sql
create table tenant_products (
		product_id serial primary key,
		tenant_id int not null references tenants(tenant_id) on delete cascade,
		name varchar(255) unique not null,
		quantity decimal(12,2) not null,
		unit_id int not null references units(unit_id),
		price decimal(10,2) not null
		category VARCHAR(100), -- NEW
		image_url VARCHAR(500), -- NEW
		description TEXT; -- NEW
);
```
# New DDL & Mock Data
## DDL
```sql
CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(255), -- NEW
    image_url VARCHAR(500), -- NEW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

	create table tenant_products (
			product_id serial primary key,
			tenant_id int not null references tenants(tenant_id) on delete cascade,
			name varchar(255) unique not null,
			quantity decimal(12,2) not null,
			unit_id int not null references units(unit_id),
			price decimal(10,2) not null
			category VARCHAR(100), -- NEW
			image_url VARCHAR(500), -- NEW
			description TEXT; -- NEW
	);

create table customers (
	customer_id serial primary key,
	name varchar(100) unique not null,
	email varchar(255) unique not null,
	phone varchar(255) unique not null,
	company varchar(255) not null,
	tax_id varchar(255) not null,
	billing_address text not null,
	shipping_address text not null,
	password_hash VARCHAR(255) not null,
	image_url VARCHAR(500), -- NEW
	created_at TIMESTAMP default current_timestamp
);

CREATE TABLE admins (
    manager_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    image_url VARCHAR(500), -- NEW
    categories TEXT[],  -- NEW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table purchase_orders (
	po_id serial primary key,
	po_number varchar(50) unique not null,
	customer_id int not null references customers(customer_id),
	tenant_id int not null references tenants(tenant_id),
	status varchar(50) default 'draft' 
		check (status in ('draft', 'submitted', 'confirmed', 'shipped', 'delivered', 'cancelled')),
	order_date timestamp default current_timestamp,
	shipping_address text not null,
	notes text,
	subtotal decimal(12,2) default 0,
	tax_amount decimal(12,2) default 0,
	total_amount decimal(12,2) default 0
);

	create table po_line_items (
		po_item_id serial primary key,
		po_id int not null references purchase_orders(po_id) on delete cascade,
		product_id int not null references tenant_products(product_id),
		quantity decimal(12, 2) not null,
		unit_price decimal(10, 2) not null,
		subtotal decimal(10, 2) generated always as (quantity * unit_price) stored
	);

CREATE TABLE units (
    unit_id SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) UNIQUE NOT NULL, 
    unit_symbol VARCHAR(10) UNIQUE NOT NULL, 
    unit_type VARCHAR(50)          
);
```
## Mock Data
If you need to remove previous data:
```sql
TRUNCATE tenants, customers, admins, units, tenant_products, purchase_orders, po_line_items 
RESTART IDENTITY CASCADE;
```

Mock data:
```sql

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
-- Green Valley Farms (tenant_id = 1)
(1, 'Organic Russet Potatoes', 50000, 1, 0.45, 'vegetables', 'https://images.example.com/potatoes.jpg', 'Premium organic russet potatoes, ideal for baking and frying'),
(1, 'Organic Carrots', 25000, 1, 0.65, 'vegetables', 'https://images.example.com/carrots.jpg', 'Sweet organic carrots, perfect for juicing or cooking'),
(1, 'Organic Onions', 30000, 1, 0.55, 'vegetables', 'https://images.example.com/onions.jpg', 'Fresh organic yellow onions'),

-- Midwest Grain Co-op (tenant_id = 2)
(2, 'Yellow Corn #2', 150000, 2, 4.25, 'grains', 'https://images.example.com/corn.jpg', 'Feed-grade yellow corn for livestock'),
(2, 'Soybeans', 75000, 2, 10.50, 'grains', 'https://images.example.com/soybeans.jpg', 'Non-GMO soybeans for oil extraction'),
(2, 'Hard Red Winter Wheat', 100000, 2, 5.75, 'grains', 'https://images.example.com/wheat.jpg', 'High protein wheat for bread flour'),

-- Sunset Orchards (tenant_id = 3) - not verified
(3, 'Gala Apples', 10000, 1, 0.85, 'fruit', 'https://images.example.com/gala.jpg', 'Sweet and crisp Gala apples'),
(3, 'Fuji Apples', 8000, 1, 0.95, 'fruit', 'https://images.example.com/fuji.jpg', 'Extra sweet Fuji apples'),

-- Prairie Meats (tenant_id = 4)
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
-- PO-001 items
(1, 1, 1000, 0.45),   -- 1000 lbs potatoes
(1, 2, 500, 0.65),    -- 500 lbs carrots

-- PO-002 items
(2, 4, 5000, 4.25),   -- 5000 bushels corn
(2, 5, 2000, 10.50),  -- 2000 bushels soybeans

-- PO-003 items
(3, 10, 2000, 3.50),  -- 2000 lbs ground beef
(3, 11, 1500, 2.75),  -- 1500 lbs chicken breast

-- PO-004 items
(4, 3, 800, 0.55),    -- 800 lbs onions
(4, 1, 2000, 0.45),   -- 2000 lbs potatoes

-- PO-005 items
(5, 11, 500, 2.25),   -- 500 lbs pork shoulder
(5, 9, 200, 12.00);   -- 200 lbs ribeye
```