'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  dish_id: string;
  name: string;
  price_cents: number;
  quantity: number;
  chef_id: string;
  chef_name: string;
  chef_slug: string;
}

interface CartContextType {
  items: CartItem[];
  chefId: string | null;
  chefName: string | null;
  chefSlug: string | null;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ridendine_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [chefId, setChefId] = useState<string | null>(null);
  const [chefName, setChefName] = useState<string | null>(null);
  const [chefSlug, setChefSlug] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const { items, chefId, chefName, chefSlug } = JSON.parse(stored);
        setItems(items || []);
        setChefId(chefId || null);
        setChefName(chefName || null);
        setChefSlug(chefSlug || null);
      } catch {
        console.error('Failed to parse cart from localStorage');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items, chefId, chefName, chefSlug })
      );
    }
  }, [items, chefId, chefName, chefSlug, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (items.length > 0 && (!chefName || !chefSlug || !chefId)) {
      const firstItem = items[0];
      setChefId(firstItem.chef_id);
      setChefName(firstItem.chef_name);
      setChefSlug(firstItem.chef_slug);
    }
  }, [items, chefId, chefName, chefSlug, isLoaded]);

  const addItem = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    // If cart has items from different chef, confirm clearing
    if (chefId && chefId !== item.chef_id) {
      const confirmed = window.confirm(
        `Your cart contains items from ${chefName}. Would you like to clear it and add items from ${item.chef_name}?`
      );
      if (!confirmed) return;
      setItems([]);
    }

    setChefId(item.chef_id);
    setChefName(item.chef_name);
    setChefSlug(item.chef_slug);

    setItems((prev) => {
      const existing = prev.find((i) => i.dish_id === item.dish_id);
      if (existing) {
        return prev.map((i) =>
          i.dish_id === item.dish_id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          id: `${item.dish_id}-${Date.now()}`,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (dishId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.dish_id !== dishId);
      if (updated.length === 0) {
        setChefId(null);
        setChefName(null);
        setChefSlug(null);
      }
      return updated;
    });
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.dish_id === dishId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setChefId(null);
    setChefName(null);
    setChefSlug(null);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        chefId,
        chefName,
        chefSlug,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
