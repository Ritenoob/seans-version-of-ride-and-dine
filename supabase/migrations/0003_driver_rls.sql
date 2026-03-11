-- Migration: Add driver RLS policies for orders
-- This allows drivers to view available orders and update orders assigned to them

-- Drivers can view orders that need delivery (no driver assigned, status is ready)
CREATE POLICY "Drivers can view available orders" ON orders
  FOR SELECT
  USING (
    driver_id IS NULL 
    AND status IN ('confirmed', 'preparing', 'ready_for_pickup')
  );

-- Drivers can view orders assigned to them
CREATE POLICY "Drivers can view assigned orders" ON orders
  FOR SELECT
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Drivers can update orders assigned to them (or claim unassigned orders)
CREATE POLICY "Drivers can update orders" ON orders
  FOR UPDATE
  USING (
    -- Can update if order is assigned to this driver
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    OR
    -- Or if order has no driver and is ready for pickup (claiming)
    (driver_id IS NULL AND status IN ('confirmed', 'preparing', 'ready_for_pickup'))
  )
  WITH CHECK (
    -- New driver_id must be this driver's ID
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  );

-- Enable RLS on drivers table if not already enabled
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own profile
CREATE POLICY "Drivers can view own profile" ON drivers
  FOR SELECT
  USING (user_id = auth.uid());

-- Drivers can update their own profile
CREATE POLICY "Drivers can update own profile" ON drivers
  FOR UPDATE
  USING (user_id = auth.uid());

-- Anyone can view online drivers (for tracking purposes)
CREATE POLICY "Public can view online drivers" ON drivers
  FOR SELECT
  USING (is_online = true);
