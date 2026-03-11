'use client';

import { useCart } from '@/lib/context/CartContext';

interface AddToCartButtonProps {
  dish: {
    id: string;
    name: string;
    price_cents: number;
    chef_id: string;
    chef_name: string;
    chef_slug: string;
  };
}

export function AddToCartButton({ dish }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  
  const existingItem = items.find((item) => item.dish_id === dish.id);
  const quantity = existingItem?.quantity || 0;

  const handleAdd = () => {
    addItem({
      dish_id: dish.id,
      name: dish.name,
      price_cents: dish.price_cents,
      chef_id: dish.chef_id,
      chef_name: dish.chef_name,
      chef_slug: dish.chef_slug,
    });
  };

  return (
    <button
      onClick={handleAdd}
      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
    >
      {quantity > 0 ? `Add More (${quantity})` : 'Add to Cart'}
    </button>
  );
}
