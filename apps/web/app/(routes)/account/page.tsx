'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Order {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  chefs: {
    display_name: string;
    slug: string;
  } | null;
}

interface Profile {
  full_name: string | null;
  name?: string | null;
  email: string;
  phone: string | null;
}

type AccountUser = User | { id: string; email: string; user_metadata?: Record<string, unknown> };

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<AccountUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      try {
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            total_cents,
            created_at,
            chefs (
              display_name,
              slug
            )
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          const rawOrders = ordersData as Array<Record<string, unknown>>;
          const transformedOrders = rawOrders.map((order) => {
            const chefsValue = order.chefs;
            const chef = Array.isArray(chefsValue) ? chefsValue[0] : chefsValue;
            return {
              id: String(order.id ?? ''),
              status: String(order.status ?? ''),
              total_cents: Number(order.total_cents ?? 0),
              created_at: String(order.created_at ?? ''),
              chefs: chef
                ? { display_name: String((chef as { display_name?: unknown }).display_name ?? ''), slug: String((chef as { slug?: unknown }).slug ?? '') }
                : null,
            } as Order;
          });
          setOrders(transformedOrders);
        }
      } catch {
        setOrders([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Account</h1>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
              activeTab === 'profile'
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
              activeTab === 'orders'
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Order History
          </button>
        </nav>

        {/* Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="border rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1">{profile?.full_name || profile?.name || user?.user_metadata?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1">{profile?.phone || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-white">
                  <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet</p>
                  <Link
                    href="/marketplace"
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Browse Chefs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/tracking?order=${order.id}`}
                      className="block border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{order.chefs?.display_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                          </span>
                          <p className="mt-1 font-semibold">{formatPrice(order.total_cents)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
