'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Chef {
  id: string;
  display_name: string;
  slug: string;
  bio: string;
  cuisine_types: string[];
  rating: number;
  review_count: number;
  is_active: boolean;
  stripe_onboarding_complete: boolean;
  created_at: string;
  user: { email: string } | null;
}

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    const { data, error } = await supabase
      .from('chefs')
      .select(`
        *,
        user:profiles!chefs_user_id_fkey(email)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setChefs(data as unknown as Chef[]);
    }
    setLoading(false);
  };

  const toggleChefStatus = async (chefId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('chefs')
      .update({ is_active: !currentStatus })
      .eq('id', chefId);

    if (!error) {
      fetchChefs();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chefs</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading chefs...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chef</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuisines</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {chefs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No chefs found
                  </td>
                </tr>
              ) : (
                chefs.map((chef) => (
                  <tr key={chef.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{chef.display_name}</div>
                      <div className="text-xs text-gray-500">{chef.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {chef.cuisine_types?.join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-yellow-500">★</span> {chef.rating?.toFixed(1) || '0.0'}
                    </td>
                    <td className="px-6 py-4 text-sm">{chef.review_count || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chef.stripe_onboarding_complete 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {chef.stripe_onboarding_complete ? 'Connected' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chef.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {chef.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleChefStatus(chef.id, chef.is_active)}
                        className={`text-sm px-3 py-1 rounded ${
                          chef.is_active 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {chef.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
