-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    profile_image_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL
);

-- Password reset token table
CREATE TABLE IF NOT EXISTS password_reset_token (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);

-- Seed admin user with proper BCrypt hash for password "admin123"
INSERT INTO users (username, email, password, is_active)
SELECT 'Admin', 'admin@streammymeal.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@streammymeal.com'
);

INSERT INTO user_roles (user_id, role)
SELECT user_id, 'ROLE_ADMIN' FROM users WHERE email = 'admin@streammymeal.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.user_id
    WHERE u.email = 'admin@streammymeal.com' AND ur.role = 'ROLE_ADMIN'
  ); 