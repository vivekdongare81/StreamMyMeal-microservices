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

-- Create live_session table
CREATE TABLE IF NOT EXISTS live_session (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    broadcast_id VARCHAR(100) NOT NULL UNIQUE,
    is_live BOOLEAN NOT NULL,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    viewers_count INTEGER DEFAULT 0,
    CONSTRAINT fk_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
); 

-- Insert all restaurant data from frontend
INSERT INTO restaurants (name, address, image) VALUES
  ('Rasooi Square', 'Downtown', 'spice-garden.jpg'),
  ('Cafe Coffee', 'College Street', 'cafe-coffee.jpg'),
  ('My Dominos Burgir', 'College Street', 'pizza-palace.jpg'),
  ('Anna Edli', 'Old Town', 'delicious-south.jpg'),
  ('Mama''s Kitchen', 'City Center', 'mamas-kitchen.jpg'),
  ('Burger Bliss', 'Mall Road', 'burger-bliss.jpg'),
  ('Thai Delight', 'Beach Road', 'thai-delight.jpg'),
  ('Tandoori Treats', 'Market Square', 'tandoori-treats.jpg'),
  ('Chinese Palace', 'College Street', 'pizza-palace.jpg'),
  ('Sushi Master', 'Uptown', 'sushi-master.jpg');

-- Insert all menu items from frontend
INSERT INTO menu_items (name, price, stock, image_url, restaurant_id) VALUES
  ('Butter Chicken', 350, 100, 'butter-chicken.jpg', 1),
  ('Garlic Naan', 80, 100, 'garlic-naan.jpg', 1),
  ('Biryani Special', 420, 100, 'biryani-special.jpg', 1),
  ('Margherita Pizza', 450, 100, 'margherita-pizza.jpg', 2),
  ('Pasta Carbonara', 380, 100, 'pasta-carbonara.jpg', 2),
  ('Salmon Sushi', 320, 100, 'salmon-sushi.jpg', 3),
  ('Tempura Udon', 280, 100, 'tempura-udon.jpg', 3),
  ('Classic Cheeseburger', 250, 100, 'classic-cheeseburger.jpg', 4),
  ('Fries', 90, 100, 'fries.jpg', 4),
  ('Pad Thai', 300, 100, 'pad-thai.jpg', 5),
  ('Green Curry', 320, 100, 'green-curry.jpg', 5),
  ('Veggie Pizza', 400, 100, 'veggie-pizza.jpg', 6),
  ('Pepperoni Pizza', 480, 100, 'pepperoni-pizza.jpg', 6),
  ('Sweet and Sour Pork', 350, 100, 'sweet-and-sour-pork.jpg', 7),
  ('Kung Pao Chicken', 340, 100, 'kung-pao-chicken.jpg', 7),
  ('Paneer Tikka', 300, 100, 'paneer-tikka.jpg', 8),
  ('Tandoori Chicken', 350, 100, 'tandoori-chicken.jpg', 8),
  ('Masala Dosa', 180, 100, 'masala-dosa.jpg', 9),
  ('Idli Sambar', 120, 100, 'idli-sambar.jpg', 9),
  ('Fish Curry', 320, 100, 'fish-curry.jpg', 10),
  ('Prawn Fry', 350, 100, 'prawn-fry.jpg', 10);

-- Insert live streaming dummy data
INSERT INTO live_session (restaurant_id, broadcast_id, is_live, started_at, ended_at, viewers_count) VALUES
  (1, 'broad-1', false, '2024-01-15 18:00:00', '2024-01-15 20:30:00', 156),
  (2, 'broad-2', false, '2024-01-16 12:00:00', '2024-01-16 14:00:00', 89),
  (3, 'broad-3', true, '2024-01-17 19:00:00', NULL, 234),
  (4, 'broad-4', false, '2024-01-14 16:00:00', '2024-01-14 18:00:00', 67),
  (5, 'broad-5', true, '2024-01-17 20:00:00', NULL, 189),
  (6, 'broad-6', false, '2024-01-13 17:00:00', '2024-01-13 19:30:00', 145),
  (7, 'broad-7', false, '2024-01-17 18:30:00', NULL, 278),
  (8, 'broad-8', true, '2024-01-12 19:00:00', '2024-01-12 21:00:00', 98),
  (9, 'broad-9', false, '2024-01-11 18:00:00', '2024-01-11 20:00:00', 123),
  (10, 'broad-10', true, '2024-01-17 21:00:00', NULL, 167); 