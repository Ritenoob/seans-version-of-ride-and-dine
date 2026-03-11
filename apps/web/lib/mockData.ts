export type MockChef = {
  id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  cuisine_types: string[];
  profile_image_url: string | null;
  cover_image_url: string | null;
  rating: number;
  review_count: number;
  is_active: boolean;
};

export type MockDish = {
  id: string;
  chef_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  category: string;
  tags: string[];
  is_available: boolean;
  preparation_time_minutes: number;
  allergens: string[];
};

export const mockChefs: MockChef[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    display_name: 'Chef Maria',
    slug: 'chef-maria',
    bio: 'Modern Mexican comfort food made with local ingredients.',
    cuisine_types: ['Mexican', 'Street Food'],
    profile_image_url: null,
    cover_image_url: null,
    rating: 4.8,
    review_count: 128,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    display_name: "Tony's Italian Kitchen",
    slug: 'tonys-italian',
    bio: 'Classic Italian favorites with a bold, rustic twist.',
    cuisine_types: ['Italian', 'Pasta'],
    profile_image_url: null,
    cover_image_url: null,
    rating: 4.6,
    review_count: 92,
    is_active: true,
  },
];

export const mockDishes: MockDish[] = [
  {
    id: 'dish-1111',
    chef_id: '11111111-1111-1111-1111-111111111111',
    name: 'Street Tacos (3)',
    description: 'Three tacos with slow-braised carnitas, pico, and crema.',
    price_cents: 1299,
    image_url: null,
    category: 'Tacos',
    tags: ['carnitas', 'cilantro', 'lime'],
    is_available: true,
    preparation_time_minutes: 20,
    allergens: ['dairy'],
  },
  {
    id: 'dish-1112',
    chef_id: '11111111-1111-1111-1111-111111111111',
    name: 'Guacamole & Chips',
    description: 'Fresh avocado, lime, jalapeno with house-made chips.',
    price_cents: 899,
    image_url: null,
    category: 'Sides',
    tags: ['vegetarian', 'gluten-free'],
    is_available: true,
    preparation_time_minutes: 10,
    allergens: [],
  },
  {
    id: 'dish-2221',
    chef_id: '22222222-2222-2222-2222-222222222222',
    name: 'Spaghetti Carbonara',
    description: 'Silky egg sauce, pecorino, pancetta, and black pepper.',
    price_cents: 1899,
    image_url: null,
    category: 'Pasta',
    tags: ['classic', 'savory'],
    is_available: true,
    preparation_time_minutes: 25,
    allergens: ['egg', 'dairy', 'gluten'],
  },
  {
    id: 'dish-2222',
    chef_id: '22222222-2222-2222-2222-222222222222',
    name: 'Margherita Pizza',
    description: 'San Marzano tomato, mozzarella, basil, olive oil.',
    price_cents: 1599,
    image_url: null,
    category: 'Pizza',
    tags: ['vegetarian'],
    is_available: true,
    preparation_time_minutes: 30,
    allergens: ['dairy', 'gluten'],
  },
];
