'use client';

import { create } from 'zustand';
import { supabase, type Product } from '../lib/supabase';

export type CartProduct = Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'category'>;

export type CartEntry = {
  product: CartProduct;
  quantity: number;
};

type CartStore = {
  items: CartEntry[];
  userId: string | null;
  isLoading: boolean;

  setUserId: (id: string | null) => void;
  addItem: (product: CartProduct) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQty: (productId: string, quantity: number) => Promise<void>;
  fetchCart: (userId: string) => Promise<void>;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  userId: null,
  isLoading: false,

  setUserId: (id) => set({ userId: id }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  clearCart: () => set({ items: [] }),

  fetchCart: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity, products(id, name, price, image_url, category)')
      .eq('user_id', userId);

    if (error) {
      console.error('[Cart] fetch error:', error.message);
      set({ isLoading: false });
      return;
    }

    const items: CartEntry[] = (data ?? []).map((row: any) => ({
      product: row.products as CartProduct,
      quantity: row.quantity,
    }));

    set({ items, isLoading: false });
  },

  addItem: async (product: CartProduct) => {
    const { userId, items } = get();

    // Optimistic local update
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }

    // Persist to Supabase if authenticated
    if (userId) {
      const newQty = (existing?.quantity ?? 0) + 1;
      await supabase.from('cart_items').upsert(
        { user_id: userId, product_id: product.id, quantity: newQty },
        { onConflict: 'user_id,product_id' }
      );
    }
  },

  removeItem: async (productId: string) => {
    const { userId, items } = get();
    set({ items: items.filter((i) => i.product.id !== productId) });

    if (userId) {
      await supabase
        .from('cart_items')
        .delete()
        .match({ user_id: userId, product_id: productId });
    }
  },

  updateQty: async (productId: string, quantity: number) => {
    const { userId, items } = get();
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    });
    if (userId) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .match({ user_id: userId, product_id: productId });
    }
  },
}));
