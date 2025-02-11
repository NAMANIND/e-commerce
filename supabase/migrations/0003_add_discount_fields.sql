-- Add new fields for discount functionality to the products table
ALTER TABLE products
ADD COLUMN discounted_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0; 