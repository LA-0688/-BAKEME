import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | any;
  description: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  userId: string | null;
  isLoading: boolean;
  // Actions
  setUserId: (id: string | null) => void;
  addItem: (product: CartProduct) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  fetchCart: (userId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  userId: null,
  isLoading: false,

  setUserId: (id) => set({ userId: id }),

  // ----------------------------------------------------------------
  // fetchCart: Reads cart_items from Supabase and populates the store.
  // Called on app load and after login.
  // ----------------------------------------------------------------
  fetchCart: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        product:products (
          id, name, price, category, image_url, description
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('[CartStore] Failed to fetch cart:', error.message);
    } else if (data) {
      const items: CartItem[] = data.map((row: any) => ({
        product: row.product,
        quantity: row.quantity,
      }));
      set({ items, isLoading: false });
    }
    set({ isLoading: false });
  },

  // ----------------------------------------------------------------
  // addItem: Optimistically updates local state, then upserts to Supabase.
  // Supabase's real-time channel will broadcast to the web app instantly.
  // ----------------------------------------------------------------
  addItem: async (product: CartProduct) => {
    const { items, userId } = get();
    const existing = items.find((i) => i.product.id === product.id);

    const newQuantity = existing ? existing.quantity + 1 : 1;

    // Optimistic local update
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQuantity } : i
        ),
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }

    // Persist to Supabase (upsert on unique(user_id, product_id))
    if (userId) {
      const { error } = await supabase.from('cart_items').upsert(
        { user_id: userId, product_id: product.id, quantity: newQuantity },
        { onConflict: 'user_id,product_id' }
      );
      if (error) console.error('[CartStore] upsert error:', error.message);
    }
  },

  // ----------------------------------------------------------------
  // removeItem: Removes from local state and deletes the row in Supabase.
  // ----------------------------------------------------------------
  removeItem: async (productId: string) => {
    const { items, userId } = get();
    set({ items: items.filter((i) => i.product.id !== productId) });

    if (userId) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .match({ user_id: userId, product_id: productId });
      if (error) console.error('[CartStore] delete error:', error.message);
    }
  },

  clearCart: () => set({ items: [] }),
}));
