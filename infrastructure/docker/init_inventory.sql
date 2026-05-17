CREATE TABLE units (
    unit_id SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) UNIQUE NOT NULL,
    unit_symbol VARCHAR(10) UNIQUE NOT NULL,
    unit_type VARCHAR(50)
);

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

-- Seed data
INSERT INTO units (unit_name, unit_symbol, unit_type) VALUES
('grams', 'g', 'weight'),
('pieces', 'pc', 'count');

INSERT INTO tenant_products (tenant_id, name, quantity, unit_id, price, category, image_url, description) VALUES
(1, 'Organic Potatoes', 5000, 1, 0.45, 'Vegetables', 'https://images.example.com/potatoes.jpg', 'Fresh organic potatoes for daily use'),
(1, 'Organic Apples', 1200, 2, 1.10, 'Fruits', 'https://images.example.com/apples.jpg', 'Crisp apples sold by the piece'),
(1, 'Black Pepper', 800, 1, 2.25, 'Spices', 'https://images.example.com/pepper.jpg', 'Aromatic ground black pepper');
