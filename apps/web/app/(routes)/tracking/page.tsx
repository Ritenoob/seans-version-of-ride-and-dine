'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/context/CartContext';

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
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal_cents: number;
  delivery_fee_cents: number;
  service_fee_cents: number;
  total_cents: number;
  delivery_address?: {
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  created_at: string;
  chefs: {
    display_name: string;
    slug: string;
  };
  location?: {
    driver?: { lat: number; lng: number };
    chef?: { lat: number; lng: number };
    customer?: { lat: number; lng: number };
  };
}

const statusSteps = [
  { key: 'confirmed', label: 'Order Confirmed', description: 'Your order has been received' },
  { key: 'preparing', label: 'Preparing', description: 'Chef is preparing your meal' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', description: 'Waiting for driver' },
  { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Driver is on the way' },
  { key: 'delivered', label: 'Delivered', description: 'Enjoy your meal!' },
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const paymentStatus = searchParams.get('redirect_status');
  const { clearCart } = useCart();
  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveLocations, setLiveLocations] = useState<Record<string, { driver?: { lat: number; lng: number }; chef?: { lat: number; lng: number }; customer?: { lat: number; lng: number } }>>({});

  useEffect(() => {
    // Clear cart after successful payment
    if (paymentStatus === 'succeeded') {
      clearCart();
    }
  }, [paymentStatus, clearCart]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          chefs (
            display_name,
            slug
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        setError('Order not found');
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // Set up real-time subscription for order updates
    const realtime = supabase as unknown as RealtimeClient;
    const channelInstance = realtime.channel ? realtime.channel(`order-${orderId}`) : undefined;
    const channel = channelInstance
      ?.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload: { new: Partial<Order> }) => {
          setOrder((prev) => prev ? { ...prev, ...payload.new } : null);
        }
      )
      ?.subscribe();

    return () => {
      realtime.removeChannel?.(channel);
    };
  }, [orderId, supabase]);

  useEffect(() => {
    if (!orderId) return;

    const realtime = supabase as unknown as RealtimeClient;
    const locationChannel = realtime.channel ? realtime.channel('ride-dine-locations') : undefined;
    const subscription = locationChannel
      ?.on('broadcast', { event: 'location' }, (payload: { payload: LiveLocationPayload }) => {
        if (payload.payload.orderId !== orderId) return;
        setLiveLocations((prev) => ({
          ...prev,
          [orderId]: {
            ...prev[orderId],
            [payload.payload.role]: { lat: payload.payload.lat, lng: payload.payload.lng },
          },
        }));
      })
      ?.subscribe();

    let watchId: string | number | null = null;
    const startWatch = async () => {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.requestPermissions();
        watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
          if (!pos) return;
          locationChannel?.send?.({
            type: 'broadcast',
            event: 'location',
            payload: {
              orderId,
              role: 'customer',
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
                orderId,
                role: 'customer',
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
      realtime.removeChannel?.(subscription);
    };
  }, [orderId, supabase]);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const mapMarkers = useMemo(() => {
    if (!order) return [];
    const fallbackChef = { lat: 43.2254, lng: -79.7588 };
    const fallbackDriver = { lat: 43.2188, lng: -79.7702 };
    const fallbackCustomer = { lat: 43.2163, lng: -79.7612 };
    const live = liveLocations[order.id] || {};
    const chefPosition = live.chef ?? order.location?.chef ?? fallbackChef;
    const driverPosition = live.driver ?? order.location?.driver ?? fallbackDriver;
    const customerPosition = live.customer ?? order.location?.customer ?? fallbackCustomer;

    return [
      {
        id: 'chef',
        position: [chefPosition.lat, chefPosition.lng] as [number, number],
        label: order.chefs?.display_name ?? 'Chef',
        role: 'chef' as const,
      },
      {
        id: 'driver',
        position: [driverPosition.lat, driverPosition.lng] as [number, number],
        label: 'Driver',
        role: 'driver' as const,
      },
      {
        id: 'customer',
        position: [customerPosition.lat, customerPosition.lng] as [number, number],
        label: 'You',
        role: 'customer' as const,
      },
    ];
  }, [order, liveLocations]);

  const getStatusIndex = (status: string) => {
    if (status === 'pending') return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">Loading order...</div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-gray-500 mb-4">No order specified</p>
          <Link href="/account" className="text-primary-600 hover:text-primary-700 font-semibold">
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-red-500 mb-4">{error || 'Order not found'}</p>
          <Link href="/marketplace" className="text-primary-600 hover:text-primary-700 font-semibold">
            Browse Chefs
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {paymentStatus === 'succeeded' && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          Payment successful! Your order has been placed.
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>

      <div className="border rounded-lg p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
            <p className="font-semibold">
              From{' '}
              <Link
                href={`/cook/${order.chefs?.slug}`}
                className="text-primary-600 hover:underline"
              >
                {order.chefs?.display_name}
              </Link>
            </p>
          </div>
          {isCancelled ? (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          ) : (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {order.status === 'pending' ? 'Processing Payment' : 'In Progress'}
            </span>
          )}
        </div>

        {/* Progress Steps */}
        {!isCancelled && (
          <div className="space-y-4 mb-6">
            {statusSteps.map((step, index) => {
              const isComplete = index <= currentStep;
              return (
                <div key={step.key} className="flex gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isComplete
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        isComplete ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-sm ${
                        isComplete ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Order Details</h3>
          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-sm border-t pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatPrice(order.delivery_fee_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>{formatPrice(order.service_fee_cents)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total_cents)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Hamilton Delivery Address</h3>
          <p className="text-sm text-gray-600">
            {order.delivery_address?.street || 'Address pending'}
            {order.delivery_address?.apartment && `, ${order.delivery_address.apartment}`}
            <br />
            {order.delivery_address?.city || 'Hamilton'}
            {order.delivery_address?.state && `, ${order.delivery_address.state}`}{' '}
            {order.delivery_address?.zipCode}
          </p>
        </div>

        {/* Live Map */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Live Map</h3>
          <MapView markers={mapMarkers} />
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-8 text-center">Loading...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
