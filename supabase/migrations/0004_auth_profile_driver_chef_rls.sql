-- Allow authenticated users to create and access their own profiles/roles

-- Profiles: allow users to insert their own profile row
CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Chefs: allow users to create their own chef record
CREATE POLICY "Chefs can create own profile" ON public.chefs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Chefs: allow users to view their own chef record (even if not active)
CREATE POLICY "Chefs can view own profile" ON public.chefs
  FOR SELECT USING (user_id = auth.uid());

-- Drivers: allow users to create their own driver record
CREATE POLICY "Drivers can create own profile" ON public.drivers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Drivers: allow users to view their own driver record
CREATE POLICY "Drivers can view own profile" ON public.drivers
  FOR SELECT USING (user_id = auth.uid());
