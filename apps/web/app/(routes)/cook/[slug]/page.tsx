import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { AddToCartButton } from './AddToCartButton';
import { mockChefs, mockDishes } from '@/lib/mockData';

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  category: string;
  tags: string[];
  is_available: boolean;
  preparation_time_minutes: number;
  allergens: string[];
}

export default async function ChefPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch chef
  const { data: chef, error: chefError } = await supabase
    .from('chefs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  const resolvedChef = !chefError && chef ? chef : mockChefs.find((entry) => entry.slug === slug);

  if (!resolvedChef) {
    notFound();
  }

  // Fetch dishes
  const { data: dishes } = await supabase
    .from('dishes')
    .select('*')
    .eq('chef_id', resolvedChef.id)
    .eq('is_available', true)
    .order('category');

  const resolvedDishes = dishes && dishes.length > 0
    ? dishes
    : mockDishes.filter((dish) => dish.chef_id === resolvedChef.id && dish.is_available);

  // Group dishes by category
  const dishesByCategory = (resolvedDishes || []).reduce((acc: Record<string, Dish[]>, dish: Dish) => {
    const category = dish.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(dish);
    return acc;
  }, {});

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-100 to-primary-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {resolvedChef.profile_image_url ? (
                <Image
                  src={resolvedChef.profile_image_url}
                  alt={resolvedChef.display_name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">👨‍🍳</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{resolvedChef.display_name}</h1>
              <p className="text-gray-700">
                {resolvedChef.cuisine_types?.join(' • ') || 'Various cuisines'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500 text-lg">
                  {'★'.repeat(Math.floor(resolvedChef.rating))}
                  {'☆'.repeat(5 - Math.floor(resolvedChef.rating))}
                </span>
                <span className="text-gray-600">
                  {resolvedChef.rating.toFixed(1)} ({resolvedChef.review_count} reviews)
                </span>
              </div>
            </div>
          </div>
          {resolvedChef.bio && (
            <p className="mt-4 text-gray-700 max-w-2xl">{resolvedChef.bio}</p>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>

        {Object.keys(dishesByCategory).length === 0 ? (
          <p className="text-gray-500">No dishes available at the moment.</p>
        ) : (
          <div className="space-y-8">
            {(Object.entries(dishesByCategory) as [string, Dish[]][]).map(([category, categoryDishes]) => (
              <div key={category}>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{category}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {categoryDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{dish.name}</h4>
                          {dish.description && (
                            <p className="text-gray-600 text-sm mt-1">{dish.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dish.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {dish.allergens && dish.allergens.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              Contains: {dish.allergens.join(', ')}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            ~{dish.preparation_time_minutes} min prep time
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between ml-4">
                          <span className="font-bold text-primary-600 text-lg">
                            {formatPrice(dish.price_cents)}
                          </span>
                          <AddToCartButton
                            dish={{
                              id: dish.id,
                              name: dish.name,
                              price_cents: dish.price_cents,
                              chef_id: resolvedChef.id,
                              chef_name: resolvedChef.display_name,
                              chef_slug: resolvedChef.slug,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
