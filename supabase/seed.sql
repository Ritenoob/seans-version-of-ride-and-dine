-- Seed data for development
-- This creates test users in auth.users first, then creates profiles and chefs

-- Insert sample promo codes (no dependencies)
INSERT INTO public.promo_codes (code, discount_type, discount_value, max_uses, expires_at, is_active)
VALUES 
  ('WELCOME20', 'percentage', 20, 500, '2025-12-31', TRUE),
  ('FREESHIP', 'free_delivery', 0, 200, '2025-12-31', TRUE),
  ('SAVE10', 'fixed', 1000, 100, '2025-12-31', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Create test users in auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'chef.maria@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Maria Garcia"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'chef.tony@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Tony Romano"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'customer@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Test Customer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'driver.john@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "John Driver"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@ridendine.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- Insert identities for email login (required by modern Supabase auth)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'chef.maria@example.com',
    'email',
    '{"sub": "00000000-0000-0000-0000-000000000001", "email": "chef.maria@example.com", "email_verified": true}',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'chef.tony@example.com',
    'email',
    '{"sub": "00000000-0000-0000-0000-000000000002", "email": "chef.tony@example.com", "email_verified": true}',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'customer@example.com',
    'email',
    '{"sub": "00000000-0000-0000-0000-000000000003", "email": "customer@example.com", "email_verified": true}',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    'driver.john@example.com',
    'email',
    '{"sub": "00000000-0000-0000-0000-000000000004", "email": "driver.john@example.com", "email_verified": true}',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'admin@ridendine.com',
    'email',
    '{"sub": "00000000-0000-0000-0000-000000000005", "email": "admin@ridendine.com", "email_verified": true}',
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert profiles for test users
INSERT INTO public.profiles (id, email, full_name, phone, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'chef.maria@example.com', 'Maria Garcia', '905-123-4567', 'chef'),
  ('00000000-0000-0000-0000-000000000002', 'chef.tony@example.com', 'Tony Romano', '905-234-5678', 'chef'),
  ('00000000-0000-0000-0000-000000000003', 'customer@example.com', 'Test Customer', '905-345-6789', 'customer'),
  ('00000000-0000-0000-0000-000000000004', 'driver.john@example.com', 'John Driver', '905-456-7890', 'driver'),
  ('00000000-0000-0000-0000-000000000005', 'admin@ridendine.com', 'Admin User', '905-000-0000', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Insert test driver
INSERT INTO public.drivers (id, user_id, display_name, phone, vehicle_type, vehicle_plate, is_online, is_available, rating, total_deliveries)
VALUES 
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000004',
    'John Driver',
    '555-456-7890',
    'car',
    'ABC 123',
    FALSE,
    TRUE,
    4.7,
    25
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test chefs
INSERT INTO public.chefs (id, user_id, display_name, slug, bio, cuisine_types, rating, review_count, is_active)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Chef Maria',
    'chef-maria',
    'Bringing authentic Mexican flavors to your table. I learned to cook from my grandmother in Oaxaca and have been sharing her recipes for over 15 years.',
    ARRAY['Mexican', 'Latin American'],
    4.8,
    42,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000002',
    'Tony''s Italian Kitchen',
    'tonys-italian',
    'Classic Italian comfort food made with love. From hand-rolled pasta to slow-simmered sauces, every dish is made from scratch.',
    ARRAY['Italian', 'Mediterranean'],
    4.9,
    67,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Insert dishes for Chef Maria
INSERT INTO public.dishes (chef_id, name, description, price_cents, category, tags, is_available, preparation_time_minutes, allergens)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Street Tacos (3)',
    'Three authentic corn tortilla tacos with your choice of carne asada, carnitas, or chicken. Topped with cilantro, onions, and salsa verde.',
    1299,
    'Main',
    ARRAY['Popular', 'Gluten-Free'],
    TRUE,
    25,
    ARRAY[]::text[]
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Enchiladas Verdes',
    'Three corn tortillas filled with shredded chicken, covered in tangy tomatillo sauce and melted cheese. Served with rice and beans.',
    1599,
    'Main',
    ARRAY['Signature'],
    TRUE,
    30,
    ARRAY['Dairy']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Guacamole & Chips',
    'Fresh-made guacamole with ripe avocados, lime, cilantro, and a hint of jalapeno. Served with crispy tortilla chips.',
    899,
    'Appetizer',
    ARRAY['Vegan', 'Gluten-Free'],
    TRUE,
    10,
    ARRAY[]::text[]
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Churros with Chocolate',
    'Crispy cinnamon-sugar churros served with rich Mexican hot chocolate dipping sauce.',
    799,
    'Dessert',
    ARRAY['Sweet'],
    TRUE,
    15,
    ARRAY['Wheat', 'Dairy']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Burrito Bowl',
    'Hearty bowl with cilantro-lime rice, black beans, your choice of protein, pico de gallo, sour cream, and cheese.',
    1499,
    'Main',
    ARRAY['Customizable'],
    TRUE,
    20,
    ARRAY['Dairy']
  );

-- Insert dishes for Tony's Italian Kitchen
INSERT INTO public.dishes (chef_id, name, description, price_cents, category, tags, is_available, preparation_time_minutes, allergens)
VALUES 
  (
    '22222222-2222-2222-2222-222222222222',
    'Spaghetti Carbonara',
    'Classic Roman pasta with crispy guanciale, egg yolk, pecorino romano, and black pepper. Simple perfection.',
    1899,
    'Main',
    ARRAY['Signature', 'Popular'],
    TRUE,
    25,
    ARRAY['Wheat', 'Eggs', 'Dairy']
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Margherita Pizza',
    'Wood-fired style pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.',
    1699,
    'Main',
    ARRAY['Vegetarian'],
    TRUE,
    20,
    ARRAY['Wheat', 'Dairy']
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Bruschetta',
    'Toasted ciabatta topped with fresh tomatoes, garlic, basil, and balsamic glaze.',
    899,
    'Appetizer',
    ARRAY['Vegan'],
    TRUE,
    10,
    ARRAY['Wheat']
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Tiramisu',
    'Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa.',
    999,
    'Dessert',
    ARRAY['Sweet', 'Signature'],
    TRUE,
    5,
    ARRAY['Wheat', 'Eggs', 'Dairy']
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Chicken Parmesan',
    'Breaded chicken cutlet topped with marinara and melted mozzarella. Served with spaghetti.',
    2199,
    'Main',
    ARRAY['Hearty'],
    TRUE,
    35,
    ARRAY['Wheat', 'Eggs', 'Dairy']
  );
