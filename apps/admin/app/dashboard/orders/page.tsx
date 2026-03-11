'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';

type RealtimeClient = {
  channel?: (name: string) => { on: (...args: unknown[]) => { subscribe: () => unknown } };
  removeChannel?: (channel: unknown) => void;
};

type LiveLocationPayload = {
  orderId: string;
  role: 'driver' | 'customer' | 'chef';
  lat: number;
  lng: number;
  timestamp: number;
};

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface Order {
  id: string;
  status: string;
  total_cents: number;
  items: Array<{ name: string; quantity: number }>;
  delivery_address: { street: string; city: string; zipCode: string };
  created_at: string;
  customer: { full_name: string; email: string; phone: string } | null;
  chef: { display_name: string } | null;
  location?: {
    driver?: { lat: number; lng: number };
    chef?: { lat: number; lng: number };
    customer?: { lat: number; lng: number };
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [liveLocations, setLiveLocations] = useState<Record<string, { driver?: { lat: number; lng: number }; chef?: { lat: number; lng: number }; customer?: { lat: number; lng: number } }>>({});

  const fetchOrders = useCallback(async () => {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:profiles!orders_customer_id_fkey(full_name, email, phone),
        chef:chefs(display_name)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setOrders(data as unknown as Order[]);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();

    // Real-time subscription
    const realtime = supabase as unknown as RealtimeClient;
    const channelInstance = realtime.channel ? realtime.channel('admin-orders') : undefined;
    const channel = channelInstance
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      ?.subscribe();

    const locationChannel = realtime.channel ? realtime.channel('ride-dine-locations') : undefined;
    const locationSubscription = locationChannel
      ?.on('broadcast', { event: 'location' }, (payload: { payload: LiveLocationPayload }) => {
        setLiveLocations((prev) => ({
          ...prev,
          [payload.payload.orderId]: {
            ...prev[payload.payload.orderId],
            [payload.payload.role]: { lat: payload.payload.lat, lng: payload.payload.lng },
          },
        }));
      })
      ?.subscribe();

    return () => {
      realtime.removeChannel?.(channel);
      realtime.removeChannel?.(locationSubscription);
    };
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
    }
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

  const statusOptions = [
    'pending',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  const mapMarkers = useMemo(() => {
    return orders.flatMap((order) => {
      const live = liveLocations[order.id] || {};
      const locations = live.driver || live.customer || live.chef ? live : order.location;
      if (!locations) return [];
      const markers = [] as Array<{ id: string; position: [number, number]; label: string; role: 'driver' | 'customer' | 'chef' | 'order' }>;
      if (locations.chef) {
        markers.push({
          id: `${order.id}-chef`,
          position: [locations.chef.lat, locations.chef.lng],
          label: order.chef?.display_name ? `Chef: ${order.chef.display_name}` : 'Chef',
          role: 'chef',
        });
      }
      if (locations.customer) {
        markers.push({
          id: `${order.id}-customer`,
          position: [locations.customer.lat, locations.customer.lng],
          label: order.customer?.full_name ? `Customer: ${order.customer.full_name}` : 'Customer',
          role: 'customer',
        });
      }
      if (locations.driver) {
        markers.push({
          id: `${order.id}-driver`,
          position: [locations.driver.lat, locations.driver.lng],
          label: 'Driver',
          role: 'driver',
        });
      }
      return markers;
    });
  }, [orders, liveLocations]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {mapMarkers.length > 0 && (
        <div className="mb-6">
          <MapView markers={mapMarkers} height="360px" />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chef</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>{order.customer?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{order.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.chef?.display_name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.total_cents)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
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
