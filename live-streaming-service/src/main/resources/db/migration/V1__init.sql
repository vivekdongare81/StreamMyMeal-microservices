-- Create live_session table (if not exists - data will be inserted by restaurant service)
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