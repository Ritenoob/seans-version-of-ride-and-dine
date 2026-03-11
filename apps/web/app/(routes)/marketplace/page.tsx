import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { mockChefs } from '@/lib/mockData';
import Link from 'next/link';

interface Chef {
  id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  cuisine_types: string[];
  profile_image_url: string | null;
  rating: number;
  review_count: number;
}

export default async function MarketplacePage() {
  const supabase = await createClient();
  
  const { data: chefs, error } = await supabase
    .from('chefs')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  const resolvedChefs = !error && chefs && chefs.length > 0 ? chefs : mockChefs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Chefs</h1>
          <p className="text-gray-600 mt-1">Discover talented local chefs and their menus</p>
        </div>
        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search chefs or cuisines..."
            className="px-4 py-2 border rounded-lg w-64"
          />
        </div>
      </div>

      {!resolvedChefs || resolvedChefs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No chefs available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resolvedChefs.map((chef: Chef) => (
            <Link
              key={chef.id}
              href={`/cook/${chef.slug}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
            >
              <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                {chef.profile_image_url ? (
                  <Image
                    src={chef.profile_image_url}
                    alt={chef.display_name}
                    width={640}
                    height={360}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">👨‍🍳</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{chef.display_name}</h3>
                <p className="text-gray-600 text-sm">
                  {chef.cuisine_types?.join(', ') || 'Various cuisines'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-500">
                    {'★'.repeat(Math.floor(chef.rating))}
                    {'☆'.repeat(5 - Math.floor(chef.rating))}
                  </span>
                  <span className="text-sm text-gray-500">
                    {chef.rating.toFixed(1)} ({chef.review_count} reviews)
                  </span>
                </div>
                {chef.bio && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{chef.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
