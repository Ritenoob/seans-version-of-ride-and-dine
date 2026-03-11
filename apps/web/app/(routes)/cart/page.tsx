'use client';

import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';

export default function CartPage() {
  const { items, chefName, chefSlug, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  const deliveryFee = 499; // $4.99 in cents
  const serviceFee = 199; // $1.99 in cents
  const total = subtotal + deliveryFee + serviceFee;

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link
            href="/marketplace"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Browse Chefs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Clear Cart
        </button>
      </div>

      <div className="mb-4 p-3 bg-primary-50 rounded-lg">
        <p className="text-sm">
          Ordering from{' '}
          <Link href={`/cook/${chefSlug}`} className="font-semibold text-primary-600 hover:underline">
            {chefName}
          </Link>
        </p>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-3xl">
              🍽️
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-primary-600 font-semibold mt-1">
                {formatPrice(item.price_cents)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.dish_id, item.quantity - 1)}
                className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.dish_id, item.quantity + 1)}
                className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.dish_id)}
                className="ml-2 text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="mt-8 bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <Link
          href="/checkout"
          className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg font-semibold mt-6 hover:bg-primary-700"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
