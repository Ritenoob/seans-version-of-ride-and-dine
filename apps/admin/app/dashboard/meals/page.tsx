'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Dish {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  tags: string[];
  is_available: boolean;
  preparation_time_minutes: number;
  chef: {
    display_name: string;
  } | null;
}

export default function MealsPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select(`
        *,
        chef:chefs(display_name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDishes(data as Dish[]);
    }
    setLoading(false);
  };

  const toggleAvailability = async (dishId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: !currentStatus })
      .eq('id', dishId);

    if (!error) {
      setDishes(dishes.map(d => 
        d.id === dishId ? { ...d, is_available: !currentStatus } : d
      ));
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const filteredDishes = dishes.filter(dish => {
    if (filter === 'available') return dish.is_available;
    if (filter === 'unavailable') return !dish.is_available;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading meals...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meals</h1>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All ({dishes.length})</option>
            <option value="available">Available ({dishes.filter(d => d.is_available).length})</option>
            <option value="unavailable">Unavailable ({dishes.filter(d => !d.is_available).length})</option>
          </select>
        </div>
      </div>

      {filteredDishes.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">No meals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div key={dish.id} className={`bg-white rounded-lg border overflow-hidden ${!dish.is_available ? 'opacity-60' : ''}`}>
              <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{dish.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    dish.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {dish.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">by {dish.chef?.display_name || 'Unknown Chef'}</p>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{dish.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{dish.category}</span>
                  {dish.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded">{tag}</span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary-600">{formatPrice(dish.price_cents)}</span>
                  <span className="text-xs text-gray-500">{dish.preparation_time_minutes} min prep</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => toggleAvailability(dish.id, dish.is_available)}
                    className={`flex-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50 ${
                      dish.is_available ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'
                    }`}
                  >
                    {dish.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
