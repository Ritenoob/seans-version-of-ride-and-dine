'use client';

import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  topChefs: Array<{ display_name: string; total_orders: number; revenue: number }>;
  topDishes: Array<{ name: string; chef_name: string; order_count: number }>;
  ordersByStatus: Record<string, number>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    
    // Calculate date filter
    let dateFilter = new Date();
    if (period === '7d') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === '30d') {
      dateFilter.setDate(dateFilter.getDate() - 30);
    } else {
      dateFilter = new Date('2000-01-01');
    }

    // Fetch orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*, chef:chefs(display_name)')
      .gte('created_at', dateFilter.toISOString());

    if (orders) {
      // Calculate metrics
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_cents || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const completedOrders = orders.filter(o => o.status === 'delivered').length;
      const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
      const cancelledOrders = orders.filter(o => ['cancelled', 'refunded'].includes(o.status)).length;

      // Orders by status
      const ordersByStatus: Record<string, number> = {};
      orders.forEach(o => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      });

      // Top chefs by revenue
      const chefRevenue: Record<string, { display_name: string; total_orders: number; revenue: number }> = {};
      orders.forEach(o => {
        if (o.chef_id) {
          if (!chefRevenue[o.chef_id]) {
            chefRevenue[o.chef_id] = {
              display_name: o.chef?.display_name || 'Unknown',
              total_orders: 0,
              revenue: 0
            };
          }
          chefRevenue[o.chef_id].total_orders++;
          chefRevenue[o.chef_id].revenue += o.total_cents || 0;
        }
      });
      const topChefs = Object.values(chefRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Count dishes from orders (simple approximation)
      const dishCounts: Record<string, { name: string; chef_name: string; order_count: number }> = {};
      orders.forEach(o => {
        const items = o.items as Array<{ name: string; quantity: number }> || [];
        items.forEach(item => {
          if (!dishCounts[item.name]) {
            dishCounts[item.name] = {
              name: item.name,
              chef_name: o.chef?.display_name || 'Unknown',
              order_count: 0
            };
          }
          dishCounts[item.name].order_count += item.quantity || 1;
        });
      });
      const topDishes = Object.values(dishCounts)
        .sort((a, b) => b.order_count - a.order_count)
        .slice(0, 5);

      setAnalytics({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        topChefs,
        topDishes,
        ordersByStatus
      });
    }
    
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(analytics.totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{analytics.totalOrders} orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(analytics.avgOrderValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-500">Completed Orders</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{analytics.completedOrders}</p>
          <p className="text-xs text-gray-400 mt-1">
            {analytics.totalOrders > 0 
              ? `${((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)}% completion rate`
              : 'No orders yet'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-500">Active Orders</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{analytics.pendingOrders}</p>
          <p className="text-xs text-gray-400 mt-1">{analytics.cancelledOrders} cancelled</p>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="font-semibold mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
            <div key={status} className="text-center p-3 bg-gray-50 rounded">
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs text-gray-500 capitalize">{status.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Top Chefs by Revenue</h3>
          {analytics.topChefs.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topChefs.map((chef, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 w-4">{i + 1}.</span>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-semibold">
                        {chef.display_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">{chef.display_name}</span>
                      <p className="text-xs text-gray-500">{chef.total_orders} orders</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">{formatPrice(chef.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Top Dishes</h3>
          {analytics.topDishes.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topDishes.map((dish, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 w-4">{i + 1}.</span>
                    <div>
                      <span className="font-medium">{dish.name}</span>
                      <p className="text-xs text-gray-500">by {dish.chef_name}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{dish.order_count} ordered</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
