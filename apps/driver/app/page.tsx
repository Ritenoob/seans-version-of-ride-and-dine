'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

type DriverUser = User | { id: string; email: string; user_metadata?: Record<string, unknown> };
type RealtimeChannel = {
  on: (...args: unknown[]) => { subscribe: () => unknown };
  subscribe?: () => unknown;
  send?: (args: { type: 'broadcast'; event: string; payload: LiveLocationPayload }) => void;
};

type RealtimeClient = {
  channel?: (name: string) => RealtimeChannel;
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
  chef_address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  delivery_address: {
    street: string;
    city: string;
    state?: string;
    zipCode: string;
  };
  items: Array<{ name: string; quantity: number }>;
  created_at: string;
  location?: {
    driver?: { lat: number; lng: number };
    chef?: { lat: number; lng: number };
    customer?: { lat: number; lng: number };
  };
  chef: {
    display_name: string;
  } | null;
  customer: {
    full_name: string;
    phone: string;
  } | null;
}

interface Driver {
  id: string;
  display_name: string;
  is_online: boolean;
  total_deliveries: number;
  rating: number;
}

export default function DriverDashboard() {
  const [user, setUser] = useState<DriverUser | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const supabase = useMemo(() => createClient(), []);
  const [liveLocations, setLiveLocations] = useState<Record<string, { driver?: { lat: number; lng: number }; chef?: { lat: number; lng: number }; customer?: { lat: number; lng: number } }>>({});

  const fetchActiveOrder = useCallback(async (driverId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        chef:chefs(display_name),
        customer:profiles!orders_customer_id_fkey(full_name, phone)
      `)
      .eq('driver_id', driverId)
      .in('status', ['out_for_delivery'])
      .single();

    if (data && !error) {
      setActiveOrder(data as unknown as Order);
    }
  }, [supabase]);

  const fetchDriverProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      setDriver(data);
      setIsOnline(data.is_online);
      await fetchActiveOrder(data.id);
    }
  }, [fetchActiveOrder, supabase]);

  // Check auth and fetch driver profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchDriverProfile(session.user.id);
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchDriverProfile(session.user.id);
      } else {
        setDriver(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchDriverProfile, supabase]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    // Fetch orders ready for pickup (no driver assigned)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        chef:chefs(display_name),
        customer:profiles!orders_customer_id_fkey(full_name, phone)
      `)
      .is('driver_id', null)
      .in('status', ['confirmed', 'preparing', 'ready_for_pickup'])
      .order('created_at', { ascending: true });

    if (!error && data) {
      setAvailableOrders(data as unknown as Order[]);
    }
  }, [supabase]);

  // Subscribe to real-time updates when driver is online
  useEffect(() => {
    if (!driver || !isOnline) return;

    fetchOrders();

    const realtime = supabase as unknown as RealtimeClient;
    const channelInstance = realtime.channel ? realtime.channel('driver-orders') : undefined;
    const channel = channelInstance
      ? channelInstance
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
            },
            () => {
              fetchOrders();
              if (driver) fetchActiveOrder(driver.id);
            }
          )
          .subscribe()
      : undefined;

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

    let watchId: string | number | null = null;
    const startWatch = async () => {
      if (!activeOrder) return;
      if (Capacitor.isNativePlatform()) {
        await Geolocation.requestPermissions();
        watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
          if (!pos) return;
          locationChannel?.send?.({
            type: 'broadcast',
            event: 'location',
            payload: {
              orderId: activeOrder.id,
              role: 'driver',
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              timestamp: Date.now(),
            },
          });
        });
        return;
      }

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            locationChannel?.send?.({
              type: 'broadcast',
              event: 'location',
              payload: {
                orderId: activeOrder.id,
                role: 'driver',
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                timestamp: Date.now(),
              },
            });
          },
          () => undefined,
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      }
    };

    startWatch();

    return () => {
      if (watchId !== null) {
        if (typeof watchId === 'string') {
          Geolocation.clearWatch({ id: watchId });
        } else {
          navigator.geolocation?.clearWatch(watchId);
        }
      }
      realtime.removeChannel?.(channel);
      realtime.removeChannel?.(locationSubscription);
    };
  }, [driver, isOnline, activeOrder, fetchOrders, fetchActiveOrder, supabase]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDriver(null);
    setActiveOrder(null);
    setAvailableOrders([]);
  };

  // Toggle online status
  const toggleOnline = async () => {
    if (!driver) return;

    const newStatus = !isOnline;
    const { error } = await supabase
      .from('drivers')
      .update({ is_online: newStatus })
      .eq('id', driver.id);

    if (!error) {
      setIsOnline(newStatus);
      if (newStatus) {
        fetchOrders();
      } else {
        setAvailableOrders([]);
      }
    }
  };

  // Accept/claim an order
  const acceptOrder = async (order: Order) => {
    if (!driver) return;

    const { error } = await supabase
      .from('orders')
      .update({ 
        driver_id: driver.id,
        status: 'out_for_delivery' 
      })
      .eq('id', order.id)
      .is('driver_id', null); // Ensure no one else claimed it

    if (!error) {
      setActiveOrder({ ...order, status: 'out_for_delivery' });
      setAvailableOrders((prev) => prev.filter((o) => o.id !== order.id));
    } else {
      // Order was claimed by someone else
      fetchOrders();
    }
  };

  // Mark order as delivered
  const markDelivered = async () => {
    if (!activeOrder || !driver) return;

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        actual_delivery_time: new Date().toISOString(),
      })
      .eq('id', activeOrder.id);

    if (!error) {
      // Update driver's delivery count
      await supabase
        .from('drivers')
        .update({ total_deliveries: driver.total_deliveries + 1 })
        .eq('id', driver.id);

      setDriver({ ...driver, total_deliveries: driver.total_deliveries + 1 });
      setActiveOrder(null);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-yellow-100 text-yellow-700',
      ready_for_pickup: 'bg-green-100 text-green-700',
      out_for_delivery: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const mapMarkers = useMemo(() => {
    if (!activeOrder) return [];
    const fallbackChef = { lat: 43.2254, lng: -79.7588 };
    const fallbackDriver = { lat: 43.2188, lng: -79.7702 };
    const fallbackCustomer = { lat: 43.2163, lng: -79.7612 };
    const live = liveLocations[activeOrder.id] || {};
    const chefPosition = live.chef ?? activeOrder.location?.chef ?? fallbackChef;
    const driverPosition = live.driver ?? activeOrder.location?.driver ?? fallbackDriver;
    const customerPosition = live.customer ?? activeOrder.location?.customer ?? fallbackCustomer;

    return [
      {
        id: 'chef',
        position: [chefPosition.lat, chefPosition.lng] as [number, number],
        label: activeOrder.chef?.display_name ?? 'Chef',
        role: 'chef' as const,
      },
      {
        id: 'driver',
        position: [driverPosition.lat, driverPosition.lng] as [number, number],
        label: 'You',
        role: 'driver' as const,
      },
      {
        id: 'customer',
        position: [customerPosition.lat, customerPosition.lng] as [number, number],
        label: activeOrder.customer?.full_name ?? 'Customer',
        role: 'customer' as const,
      },
    ];
  }, [activeOrder, liveLocations]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Login screen
  if (!user || !driver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-primary-600 mb-6">
            Ride & Dine Driver
          </h1>
          
          {user && !driver && (
            <div className="text-center py-4 mb-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">Your account is not registered as a driver.</p>
              <p className="text-sm text-yellow-600 mt-1">Please contact support to become a driver.</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="driver@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {loginError && (
              <p className="text-red-600 text-sm">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Demo driver: driver.john@example.com / password123
          </p>
        </div>
      </div>
    );
  }

  // Main driver dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary-600 text-white p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-bold">{driver.display_name}</h1>
            <p className="text-xs opacity-80">{driver.total_deliveries} deliveries</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleOnline}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                isOnline ? 'bg-green-500' : 'bg-gray-500'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm bg-white/20 rounded hover:bg-white/30"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* Offline message */}
        {!isOnline && !activeOrder && (
          <div className="text-center py-12 bg-white rounded-lg border mb-4">
            <p className="text-xl font-semibold text-gray-700">You&apos;re offline</p>
            <p className="text-gray-500 mt-2">Go online to see available orders</p>
            <button
              onClick={toggleOnline}
              className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              Go Online
            </button>
          </div>
        )}

        {/* Active Order */}
        {activeOrder && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6 border-2 border-primary-500">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-lg font-bold text-primary-600">Active Delivery</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activeOrder.status)}`}>
                {activeOrder.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Pickup from</p>
                <p className="font-semibold">{activeOrder.chef?.display_name || 'Chef'}</p>
                <p className="text-sm">
                  {activeOrder.chef_address?.street || 'Eastgate Mall Area'}
                </p>
                <p className="text-sm">
                  {activeOrder.chef_address?.city || 'Hamilton'}
                  {activeOrder.chef_address?.state && `, ${activeOrder.chef_address.state}`}
                  {activeOrder.chef_address?.zipCode && ` ${activeOrder.chef_address.zipCode}`}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Deliver to</p>
                <p className="font-semibold">{activeOrder.customer?.full_name || 'Customer'}</p>
                <p className="text-sm">{activeOrder.delivery_address?.street || 'Hamilton address pending'}</p>
                <p className="text-sm">
                  {activeOrder.delivery_address?.city || 'Hamilton'}
                  {activeOrder.delivery_address?.state && `, ${activeOrder.delivery_address.state}`}
                  {activeOrder.delivery_address?.zipCode && ` ${activeOrder.delivery_address.zipCode}`}
                </p>
                {activeOrder.customer?.phone && (
                  <a href={`tel:${activeOrder.customer.phone}`} className="text-primary-600 text-sm font-medium">
                    Call: {activeOrder.customer.phone}
                  </a>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Order Items</p>
                {activeOrder.items?.map((item, idx) => (
                  <p key={idx} className="text-sm">{item.quantity}x {item.name}</p>
                ))}
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500 mb-2">Live Route</p>
                <MapView markers={mapMarkers} height="240px" />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg">{formatPrice(activeOrder.total_cents)}</span>
                <button
                  onClick={markDelivered}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Mark as Delivered
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Available Orders - only show when online */}
        {isOnline && (
          <div>
            <h2 className="text-lg font-bold mb-4">
              {activeOrder ? 'Other Available Orders' : 'Available Orders'}
            </h2>

            {availableOrders.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border">
                <p className="text-gray-500">No orders available right now</p>
                <p className="text-sm text-gray-400 mt-1">New orders will appear here automatically</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{order.chef?.display_name || 'Chef'}</p>
                        <p className="text-sm text-gray-500">
                      {(order.delivery_address?.city || 'Hamilton')} - {order.items?.length || 0} item(s)
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 mb-2">
                      {order.delivery_address?.street || 'Hamilton address pending'}, {order.delivery_address?.city || 'Hamilton'}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold">{formatPrice(order.total_cents)}</span>
                      {!activeOrder && (
                        <button
                          onClick={() => acceptOrder(order)}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700"
                        >
                          Accept Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
