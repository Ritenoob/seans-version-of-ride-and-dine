-- Fix RLS policies for orders table
-- Allow customers to create orders

-- Customers can create orders for themselves
CREATE POLICY "Customers can create orders" ON public.orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Customers can update their own orders (e.g., cancel)
CREATE POLICY "Customers can update own orders" ON public.orders
  FOR UPDATE USING (customer_id = auth.uid());

-- Chefs can update orders for their meals (e.g., change status)
CREATE POLICY "Chefs can update orders for their meals" ON public.orders
  FOR UPDATE USING (
    chef_id IN (SELECT id FROM public.chefs WHERE user_id = auth.uid())
  );

-- Allow payments to be created by authenticated users
CREATE POLICY "Authenticated users can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to view their payments
CREATE POLICY "Users can view payments for their orders" ON public.payments
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
  );
