-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    image VARCHAR(255)
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price NUMERIC(10,2),
    stock INTEGER,
    image_url VARCHAR(255),
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id)
); 