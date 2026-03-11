-- Ride & Dine Database Schema
-- Initial migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USERS & AUTH (extends Supabase auth.users)
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'chef', 'driver', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CHEFS
-- ============================================

CREATE TABLE public.chefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  cuisine_types TEXT[] DEFAULT '{}',
  profile_image_url TEXT,
  cover_image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chefs_user_id ON public.chefs(user_id);
CREATE INDEX idx_chefs_slug ON public.chefs(slug);
CREATE INDEX idx_chefs_is_active ON public.chefs(is_active);

-- ============================================
-- DISHES (Meals)
-- ============================================

CREATE TABLE public.dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chef_id UUID NOT NULL REFERENCES public.chefs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  preparation_time_minutes INTEGER DEFAULT 30,
  serving_size TEXT,
  allergens TEXT[] DEFAULT '{}',
  nutrition_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dishes_chef_id ON public.dishes(chef_id);
CREATE INDEX idx_dishes_is_available ON public.dishes(is_available);

-- ============================================
-- DRIVERS
-- ============================================

CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('car', 'motorcycle', 'bicycle', 'scooter')),
  vehicle_plate TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  current_location GEOGRAPHY(POINT, 4326),
  rating DECIMAL(2,1) DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX idx_drivers_is_online ON public.drivers(is_online);
CREATE INDEX idx_drivers_location ON public.drivers USING GIST(current_location);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  chef_id UUID NOT NULL REFERENCES public.chefs(id),
  driver_id UUID REFERENCES public.drivers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'preparing', 'ready_for_pickup',
    'out_for_delivery', 'delivered', 'cancelled', 'refunded'
  )),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal_cents INTEGER NOT NULL,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 499,
  service_fee_cents INTEGER NOT NULL DEFAULT 199,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  tip_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  discount_cents INTEGER DEFAULT 0,
  promo_code TEXT,
  delivery_address JSONB NOT NULL,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_chef_id ON public.orders(chef_id);
CREATE INDEX idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'processing', 'succeeded', 'failed', 'refunded'
  )),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_stripe_pi ON public.payments(stripe_payment_intent_id);

-- ============================================
-- CHEF LEDGER (Revenue Tracking)
-- ============================================

CREATE TABLE public.chef_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chef_id UUID NOT NULL REFERENCES public.chefs(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  gross_amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  stripe_fee_cents INTEGER NOT NULL,
  net_earning_cents INTEGER NOT NULL,
  available_for_payout BOOLEAN DEFAULT FALSE,
  payout_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chef_ledger_chef_id ON public.chef_ledger(chef_id);
CREATE INDEX idx_chef_ledger_payout ON public.chef_ledger(available_for_payout);

-- ============================================
-- PAYOUTS
-- ============================================

CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chef_id UUID NOT NULL REFERENCES public.chefs(id) ON DELETE CASCADE,
  total_amount_cents INTEGER NOT NULL,
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed'
  )),
  payout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ledger_entries UUID[] DEFAULT '{}',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_chef_id ON public.payouts(chef_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_payouts_date ON public.payouts(payout_date DESC);

-- ============================================
-- PROMO CODES
-- ============================================

CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_delivery')),
  discount_value INTEGER NOT NULL, -- percentage (0-100) or cents
  min_order_cents INTEGER DEFAULT 0,
  max_discount_cents INTEGER,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(is_active);

-- ============================================
-- REVIEWS
-- ============================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  chef_id UUID NOT NULL REFERENCES public.chefs(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_chef_id ON public.reviews(chef_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Chefs: Public can read active chefs
CREATE POLICY "Anyone can view active chefs" ON public.chefs
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Chefs can update own profile" ON public.chefs
  FOR UPDATE USING (user_id = auth.uid());

-- Dishes: Public can read available dishes
CREATE POLICY "Anyone can view available dishes" ON public.dishes
  FOR SELECT USING (is_available = TRUE);

CREATE POLICY "Chefs can manage own dishes" ON public.dishes
  FOR ALL USING (
    chef_id IN (SELECT id FROM public.chefs WHERE user_id = auth.uid())
  );

-- Orders: Customers can view own orders, chefs can view orders for their meals
CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Chefs can view orders for their meals" ON public.orders
  FOR SELECT USING (
    chef_id IN (SELECT id FROM public.chefs WHERE user_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chefs_updated_at
  BEFORE UPDATE ON public.chefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON public.dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update chef rating when a new review is added
CREATE OR REPLACE FUNCTION update_chef_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chefs
  SET 
    rating = (SELECT AVG(rating) FROM public.reviews WHERE chef_id = NEW.chef_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE chef_id = NEW.chef_id)
  WHERE id = NEW.chef_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chef_rating_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_chef_rating();
