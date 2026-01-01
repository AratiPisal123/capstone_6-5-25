INSERT INTO users (name, email, mobile, password, role, email_verified, mobile_verified, profile_image, created_at, updated_at, last_login, is_active)
VALUES (
  'Demo User',
  'demo@pharma.com',
  '9999999999',
  '$2a$12$h6bK8Xo2k.3Qqv0y1m8bEOT5aYJ5cB1o0t3oPSePpF0u0wM5vR1Qe',
  'CUSTOMER',
  true,
  true,
  null,
  NOW(),
  NOW(),
  NOW(),
  true
);
