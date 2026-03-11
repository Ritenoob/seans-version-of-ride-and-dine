type MockUser = {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
};

type MockSession = {
  user: MockUser;
};

type MockDb = {
  users: Array<MockUser & { password: string }>;
  profiles: Array<{ id: string; email: string; full_name: string | null; phone: string | null; role: string }>;
  chefs: Array<{ id: string; user_id: string; display_name: string; slug: string; is_active: boolean }>;
  drivers: Array<{ id: string; user_id: string; display_name: string; phone: string; is_online: boolean; is_available: boolean; rating?: number; total_deliveries?: number }>;
  dishes: Array<Record<string, unknown>>;
  promo_codes: Array<{ id: string; code: string; discount_type: string; discount_value: number; max_uses: number; expires_at: string; is_active: boolean; uses?: number }>;
  orders: Array<Record<string, unknown>>;
};

const STORAGE_KEY = 'ridendine_mock_db';
const SESSION_KEY = 'ridendine_mock_session';

type AuthListener = (event: string, session: MockSession | null) => void;
const authListeners = new Set<AuthListener>();

const notifyAuth = (event: string, session: MockSession | null) => {
  authListeners.forEach((listener) => listener(event, session));
};

const defaultDb: MockDb = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'chef.maria@example.com',
      password: 'password123',
      user_metadata: { full_name: 'Maria Garcia' },
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'chef.tony@example.com',
      password: 'password123',
      user_metadata: { full_name: 'Tony Romano' },
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'customer@example.com',
      password: 'password123',
      user_metadata: { full_name: 'Test Customer' },
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'driver.john@example.com',
      password: 'password123',
      user_metadata: { full_name: 'John Driver' },
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'admin@ridendine.com',
      password: 'password123',
      user_metadata: { full_name: 'Admin User' },
    },
  ],
  profiles: [
    { id: '00000000-0000-0000-0000-000000000001', email: 'chef.maria@example.com', full_name: 'Maria Garcia', phone: '555-123-4567', role: 'chef' },
    { id: '00000000-0000-0000-0000-000000000002', email: 'chef.tony@example.com', full_name: 'Tony Romano', phone: '555-234-5678', role: 'chef' },
    { id: '00000000-0000-0000-0000-000000000003', email: 'customer@example.com', full_name: 'Test Customer', phone: '555-345-6789', role: 'customer' },
    { id: '00000000-0000-0000-0000-000000000004', email: 'driver.john@example.com', full_name: 'John Driver', phone: '555-456-7890', role: 'driver' },
    { id: '00000000-0000-0000-0000-000000000005', email: 'admin@ridendine.com', full_name: 'Admin User', phone: '555-000-0000', role: 'admin' },
  ],
  chefs: [
    { id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000001', display_name: 'Chef Maria', slug: 'chef-maria', is_active: true },
    { id: '22222222-2222-2222-2222-222222222222', user_id: '00000000-0000-0000-0000-000000000002', display_name: "Tony's Italian Kitchen", slug: 'tonys-italian', is_active: true },
  ],
  drivers: [
    { id: '33333333-3333-3333-3333-333333333333', user_id: '00000000-0000-0000-0000-000000000004', display_name: 'John Driver', phone: '555-456-7890', is_online: false, is_available: true, rating: 4.7, total_deliveries: 25 },
  ],
  dishes: [],
  promo_codes: [
    { id: 'promo-001', code: 'WELCOME20', discount_type: 'percentage', discount_value: 20, max_uses: 500, expires_at: '2025-12-31', is_active: true, uses: 112 },
    { id: 'promo-002', code: 'FREESHIP', discount_type: 'free_delivery', discount_value: 0, max_uses: 200, expires_at: '2025-12-31', is_active: true, uses: 74 },
    { id: 'promo-003', code: 'SAVE10', discount_type: 'fixed', discount_value: 1000, max_uses: 100, expires_at: '2025-12-31', is_active: true, uses: 39 },
  ],
  orders: [
    {
      id: '44444444-4444-4444-4444-444444444444',
      status: 'out_for_delivery',
      items: [
        { name: 'Street Tacos (3)', quantity: 2, price: 1299 },
        { name: 'Guacamole & Chips', quantity: 1, price: 899 },
      ],
      subtotal_cents: 3487,
      delivery_fee_cents: 499,
      service_fee_cents: 199,
      tax_cents: 0,
      total_cents: 4185,
      delivery_address: {
        street: '123 Market St',
        city: 'Hamilton',
        state: 'ON',
        zipCode: 'L8K 1H1',
      },
      created_at: new Date().toISOString(),
      customer_id: '00000000-0000-0000-0000-000000000003',
      chef_id: '11111111-1111-1111-1111-111111111111',
      driver_id: '33333333-3333-3333-3333-333333333333',
      location: {
        driver: { lat: 43.2188, lng: -79.7702 },
        chef: { lat: 43.2254, lng: -79.7588 },
        customer: { lat: 43.2163, lng: -79.7612 },
      },
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      status: 'ready_for_pickup',
      items: [
        { name: 'Spaghetti Carbonara', quantity: 1, price: 1899 },
      ],
      subtotal_cents: 1899,
      delivery_fee_cents: 499,
      service_fee_cents: 199,
      tax_cents: 0,
      total_cents: 2597,
      delivery_address: {
        street: '780 Mission St',
        city: 'Hamilton',
        state: 'ON',
        zipCode: 'L8K 1B3',
      },
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      customer_id: '00000000-0000-0000-0000-000000000003',
      chef_id: '22222222-2222-2222-2222-222222222222',
      driver_id: null,
      location: {
        chef: { lat: 43.2267, lng: -79.7699 },
        customer: { lat: 43.2134, lng: -79.7556 },
      },
    },
  ],
};

const getDb = (): MockDb => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
    return structuredClone(defaultDb);
  }
  const parsed = JSON.parse(raw) as MockDb;
  if (!parsed.orders) {
    parsed.orders = [];
  }
  const defaultOrders = structuredClone(defaultDb.orders);
  const existingOrders = parsed.orders as Array<Record<string, unknown>>;
  const byId = new Map(existingOrders.map((order) => [String(order.id), order]));
  defaultOrders.forEach((order) => {
    const existing = byId.get(String(order.id));
    if (!existing) {
      existingOrders.push(order);
      return;
    }
    if (!('location' in existing)) {
      existing.location = (order as Record<string, unknown>).location;
    }
  });
  if (!parsed.dishes) {
    parsed.dishes = structuredClone(defaultDb.dishes);
  }
  if (!parsed.promo_codes) {
    parsed.promo_codes = structuredClone(defaultDb.promo_codes);
  }
  return parsed;
};

const saveDb = (db: MockDb) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const getSession = (): MockSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as MockSession) : null;
};

const setSession = (session: MockSession | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `mock-${Math.random().toString(36).slice(2, 11)}`;
};

const applyFilters = (rows: Array<Record<string, unknown>> | undefined, filters: Array<{ field: string; op: 'eq' | 'is' | 'in' | 'gte' | 'lte'; value: unknown }>) => {
  const safeRows = rows ?? [];
  return safeRows.filter((row) =>
    filters.every((filter) => {
      const value = row[filter.field as keyof typeof row];
      if (filter.op === 'eq') return value === filter.value;
      if (filter.op === 'is') return value === filter.value;
      if (filter.op === 'in' && Array.isArray(filter.value)) return filter.value.includes(value);
      if (filter.op === 'gte') {
        if (value === undefined || value === null || filter.value === null || filter.value === undefined) return false;
        return String(value) >= String(filter.value);
      }
      if (filter.op === 'lte') {
        if (value === undefined || value === null || filter.value === null || filter.value === undefined) return false;
        return String(value) <= String(filter.value);
      }
      return true;
    })
  );
};

const attachRelations = (table: string, rows: Array<Record<string, unknown>>, select?: string) => {
  if (table !== 'orders' || !select) return rows;
  const db = getDb();
  return rows.map((order) => {
    const next = { ...order };
    if (select.includes('chef:chefs')) {
      const chef = db.chefs.find((c) => c.id === order.chef_id);
      next.chef = chef ? { display_name: chef.display_name } : null;
    }
    if (select.includes('customer:profiles')) {
      const customer = db.profiles.find((p) => p.id === order.customer_id);
      next.customer = customer ? { full_name: customer.full_name, email: customer.email } : null;
    }
    return next;
  });
};

const createQuery = (table: keyof MockDb) => {
  const filters: Array<{ field: string; op: 'eq' | 'is' | 'in' | 'gte' | 'lte'; value: unknown }> = [];
  let updateData: Record<string, unknown> | null = null;
  let selected: string | undefined;
  let selectOptions: { count?: 'exact'; head?: boolean } | undefined;
  let orderBy: { field: string; ascending: boolean } | null = null;
  let limitCount: number | null = null;
  let deleteMode = false;

  const execute = async () => {
    const db = getDb();
    const rows = applyFilters(db[table] as Array<Record<string, unknown>>, filters);
    let result = rows;

    if (updateData) {
      result = rows.map((row) => ({ ...row, ...updateData }));
      const updated = (db[table] as Array<Record<string, unknown>>).map((row) => {
        const match = rows.find((r) => r.id === row.id);
        return match ? { ...row, ...updateData } : row;
      });
      db[table] = updated as never;
      saveDb(db);
    }

    if (deleteMode) {
      const remaining = (db[table] as Array<Record<string, unknown>>).filter((row) => !rows.find((r) => r.id === row.id));
      db[table] = remaining as never;
      saveDb(db);
    }

    if (orderBy) {
      const { field, ascending } = orderBy;
      result = [...result].sort((a, b) => {
        const av = a[field as keyof typeof a];
        const bv = b[field as keyof typeof b];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        return (av as number | string) > (bv as number | string) ? (ascending ? 1 : -1) : (ascending ? -1 : 1);
      });
    }

    if (limitCount !== null) {
      result = result.slice(0, limitCount);
    }

    result = attachRelations(table, result, selected);

    const count = selectOptions?.count ? result.length : null;
    const data = selectOptions?.head ? null : result;

    return { data, error: null, count };
  };

  const query = {
    select(value?: string, options?: { count?: 'exact'; head?: boolean }) {
      selected = value;
      selectOptions = options;
      return query;
    },
    eq(field: string, value: unknown) {
      filters.push({ field, op: 'eq', value });
      return query;
    },
    in(field: string, value: unknown[]) {
      filters.push({ field, op: 'in', value });
      return query;
    },
    gte(field: string, value: unknown) {
      filters.push({ field, op: 'gte', value });
      return query;
    },
    lte(field: string, value: unknown) {
      filters.push({ field, op: 'lte', value });
      return query;
    },
    order(field: string, options: { ascending: boolean }) {
      orderBy = { field, ascending: options.ascending };
      return query;
    },
    limit(count: number) {
      limitCount = count;
      return query;
    },
    update(values: Record<string, unknown>) {
      updateData = values;
      return query;
    },
    delete() {
      deleteMode = true;
      return query;
    },
    async single() {
      const { data } = await execute();
      if (!data) return { data: null, error: null };
      return { data: data[0] ?? null, error: null };
    },
    then(resolve: (value: { data: Array<Record<string, unknown>> | null; error: null; count: number | null }) => void, reject: (reason?: unknown) => void) {
      execute().then(resolve, reject);
    },
  };

  return query;
};

export const createMockClient = () => {
  return {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const db = getDb();
        const existing = db.users.find((u) => u.email === email && u.password === password);
        if (!existing) {
          return { data: { user: null }, error: { message: 'Invalid login credentials' } };
        }
        const user: MockUser = { id: existing.id, email: existing.email, user_metadata: existing.user_metadata };
        const session = { user };
        setSession(session);
        notifyAuth('SIGNED_IN', session);
        return { data: { user }, error: null };
      },
      async getUser() {
        const session = getSession();
        return { data: { user: session?.user ?? null }, error: null };
      },
      async getSession() {
        const session = getSession();
        return { data: { session: session ?? null }, error: null };
      },
      async signOut() {
        setSession(null);
        notifyAuth('SIGNED_OUT', null);
        return { error: null };
      },
      onAuthStateChange(callback: (event: string, session: MockSession | null) => void) {
        const session = getSession();
        authListeners.add(callback);
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
      },
    },
    channel() {
      return {
        on() {
          return this;
        },
        subscribe() {
          return this;
        },
      };
    },
    removeChannel() {
      return;
    },
    from(table: keyof MockDb) {
      const db = getDb();
      return {
        insert(values: Record<string, unknown> | Array<Record<string, unknown>>) {
          const entries = Array.isArray(values) ? values : [values];
          const withIds = entries.map((entry) => ({ id: entry.id ?? createId(), ...entry }));
          (db[table] as Array<Record<string, unknown>>).push(...withIds);
          saveDb(db);
          return Promise.resolve({ data: withIds, error: null });
        },
        ...createQuery(table),
      };
    },
  };
};
