'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Stats {
  totalRevenue: number;
  activeOrders: number;
  activeChefs: number;
  totalCustomers: number;
}

interface Order {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  customer: { full_name: string; email: string } | null;
  chef: { display_name: string } | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    activeOrders: 0,
    activeChefs: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch orders with related data
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        *,
        customer:profiles!orders_customer_id_fkey(full_name, email),
        chef:chefs(display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch stats
    const { count: activeOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery']);

    const { count: activeChefs } = await supabase
      .from('chefs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // Calculate total revenue from delivered orders
    const { data: deliveredOrders } = await supabase
      .from('orders')
      .select('total_cents')
      .eq('status', 'delivered');

    const totalRevenue = deliveredOrders?.reduce((sum, o) => sum + o.total_cents, 0) || 0;

    setStats({
      totalRevenue,
      activeOrders: activeOrders || 0,
      activeChefs: activeChefs || 0,
      totalCustomers: totalCustomers || 0,
    });

    setRecentOrders((orders as unknown as Order[]) || []);
    setLoading(false);
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-yellow-100 text-yellow-700',
      ready_for_pickup: 'bg-orange-100 text-orange-700',
      out_for_delivery: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  const statsDisplay = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), change: '' },
    { label: 'Active Orders', value: stats.activeOrders.toString(), change: '' },
    { label: 'Active Chefs', value: stats.activeChefs.toString(), change: '' },
    { label: 'Total Customers', value: stats.totalCustomers.toString(), change: '' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chef</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.customer?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.chef?.display_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">{formatPrice(order.total_cents)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
