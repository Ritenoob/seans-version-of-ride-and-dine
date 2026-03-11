const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function createUser(email, password, fullName) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (body.includes('already exists') || body.includes('email_exists')) {
      const existing = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers,
      });
      const existingJson = await existing.json();
      return existingJson?.users?.[0]?.id;
    }
    if (body.includes('duplicate key')) {
      const existing = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers,
      });
      const existingJson = await existing.json();
      return existingJson?.users?.[0]?.id;
    }
    throw new Error(`Failed to create user ${email}: ${body}`);
  }

  const json = await res.json();
  return json.id;
}

async function upsert(table, rows) {
  const uniqueRows = [];
  const seen = new Set();
  for (const row of rows) {
    const key = row.id || JSON.stringify(row);
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueRows.push(row);
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...headers,
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(uniqueRows),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed upsert ${table}: ${body}`);
  }
  return res.json();
}

async function run() {
  const adminId = await createUser('admin@ridendine.com', 'password123', 'Admin User');
  const driverId = await createUser('driver.john@example.com', 'password123', 'John Driver');
  const customerId = await createUser('customer@example.com', 'password123', 'Test Customer');
  const chefMariaId = await createUser('chef.maria@example.com', 'password123', 'Maria Garcia');
  const chefTonyId = await createUser('chef.tony@example.com', 'password123', 'Tony Romano');

  await upsert('profiles', [
    { id: adminId, email: 'admin@ridendine.com', role: 'admin', name: 'Admin User' },
    { id: driverId, email: 'driver.john@example.com', role: 'driver', name: 'John Driver' },
    { id: customerId, email: 'customer@example.com', role: 'customer', name: 'Test Customer' },
    { id: chefMariaId, email: 'chef.maria@example.com', role: 'chef', name: 'Maria Garcia' },
    { id: chefTonyId, email: 'chef.tony@example.com', role: 'chef', name: 'Tony Romano' },
  ]);

  const chefs = await upsert('chefs', [
    {
      profile_id: chefMariaId,
      status: 'approved',
      address: 'Hamilton, ON, Canada',
      cuisine_types: 'Mexican',
      bio: 'Modern Mexican comfort food made with local ingredients.',
      rating: 4.8,
      is_featured: true,
    },
    {
      profile_id: chefTonyId,
      status: 'approved',
      address: 'Hamilton, ON, Canada',
      cuisine_types: 'Italian',
      bio: 'Classic Italian favorites with a bold, rustic twist.',
      rating: 4.6,
      is_featured: false,
    },
  ]);

  const drivers = await upsert('drivers', [
    {
      profile_id: driverId,
      name: 'John Driver',
      status: 'online',
      phone: '+1-555-456-7890',
      vehicle_type: 'Car',
    },
  ]);

  const chefMaria = chefs.find((c) => c.profile_id === chefMariaId) || chefs[0];
  const chefTony = chefs.find((c) => c.profile_id === chefTonyId) || chefs[1];
  const driver = drivers[0];

  const statusOptions = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled', 'pending', 'completed', 'out_for_delivery'];
  let statusIndex = 0;

  const baseOrders = [
    {
      status: statusOptions[statusIndex],
      delivery_method: 'delivery',
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
        street: '123 Queenston Rd',
        city: 'Hamilton',
      },
      created_at: new Date().toISOString(),
      customer_id: customerId,
      chef_id: chefMaria?.id,
      driver_id: driver?.id,
      location: {
        driver: { lat: 43.2188, lng: -79.7702 },
        chef: { lat: 43.2254, lng: -79.7588 },
        customer: { lat: 43.2163, lng: -79.7612 },
      },
    },
    {
      status: statusOptions[Math.min(statusIndex + 1, statusOptions.length - 1)],
      delivery_method: 'pickup',
      items: [{ name: 'Spaghetti Carbonara', quantity: 1, price: 1899 }],
      subtotal_cents: 1899,
      delivery_fee_cents: 499,
      service_fee_cents: 199,
      tax_cents: 0,
      total_cents: 2597,
      delivery_address: {
        street: '780 King St E',
        city: 'Hamilton',
      },
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      customer_id: customerId,
      chef_id: chefTony?.id,
      driver_id: null,
      location: {
        chef: { lat: 43.2267, lng: -79.7699 },
        customer: { lat: 43.2134, lng: -79.7556 },
      },
    },
  ];

  const removableFields = [
    'delivery_address',
    'location',
    'items',
    'driver_id',
    'subtotal_cents',
    'delivery_fee_cents',
    'service_fee_cents',
    'tax_cents',
  ];

  let ordersPayload = baseOrders.map((order) => ({ ...order }));
  const removeField = (field) => {
    ordersPayload = ordersPayload.map((order) => {
      const { [field]: _removed, ...rest } = order;
      return rest;
    });
  };

  for (;;) {
    try {
      await upsert('orders', ordersPayload);
      ordersPayload = [];
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('orders_status_check') && statusIndex < statusOptions.length - 1) {
        statusIndex += 1;
        ordersPayload = ordersPayload.map((order, index) => ({
          ...order,
          status: statusOptions[Math.min(statusIndex + index, statusOptions.length - 1)],
        }));
        continue;
      }
      const match = message.match(/orders\.([a-zA-Z0-9_]+)/) || message.match(/'([a-zA-Z0-9_]+)' column/);
      const missingField = match?.[1];
      if (missingField && removableFields.includes(missingField)) {
        removeField(missingField);
        continue;
      }
      throw error;
    }
  }

  if (ordersPayload.length > 0) {
    await upsert('orders', ordersPayload);
  }

  console.log('Seed complete');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
