-- Insert all restaurant data from frontend
INSERT INTO restaurants (name, address, image) VALUES
  ('Spice Garden', 'Downtown', 'spice-garden.jpg'),
  ('Mama''s Kitchen', 'City Center', 'mamas-kitchen.jpg'),
  ('Sushi Master', 'Uptown', 'sushi-master.jpg'),
  ('Burger Bliss', 'Mall Road', 'burger-bliss.jpg'),
  ('Thai Delight', 'Beach Road', 'thai-delight.jpg'),
  ('Pizza Palace', 'College Street', 'pizza-palace.jpg'),
  ('Chinese Palace', 'College Street', 'pizza-palace.jpg'),
  ('Chinese Palace', 'College Street', 'cafe-coffee,jpg'),
  ('Tandoori Treats', 'Market Square', 'tandoori-treats.jpg'),
  ('Delicious South', 'Old Town', 'delicious-south.jpg');

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