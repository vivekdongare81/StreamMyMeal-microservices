-- Create admin user if not exists
INSERT INTO users (username, email, password, is_active)
SELECT 'Admin', 'admin@streammymeal.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@streammymeal.com'
);

-- Assign admin role if not exists
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'ROLE_ADMIN' FROM users WHERE email = 'admin@streammymeal.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.user_id
    WHERE u.email = 'admin@streammymeal.com' AND ur.role = 'ROLE_ADMIN'
  ); 