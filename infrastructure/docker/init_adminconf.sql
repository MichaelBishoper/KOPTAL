-- admin_settings
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    categories TEXT[] NOT NULL DEFAULT '{}',
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 11.00
);

INSERT INTO admin_settings (id, categories, tax_rate) VALUES (1, ARRAY['Vegetables', 'Fruits', 'Spices'], 11.00);
