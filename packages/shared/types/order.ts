export interface Order {
  id: string;
  customerId: string;
  chefId: string;
  driverId: string | null;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number; // in cents
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  tip: number;
  total: number;
  promoCode: string | null;
  discount: number;
  deliveryAddress: DeliveryAddress;
  specialInstructions: string | null;
  estimatedDeliveryTime: string | null;
  actualDeliveryTime: string | null;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  dishId: string;
  name: string;
  quantity: number;
  price: number; // in cents
  specialInstructions: string | null;
}

export interface DeliveryAddress {
  street: string;
  apartment: string | null;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderWithDetails extends Order {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  chef: {
    id: string;
    displayName: string;
    slug: string;
  };
  driver: {
    id: string;
    name: string;
    phone: string;
  } | null;
}
