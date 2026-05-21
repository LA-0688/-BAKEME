import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Web] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
    'Add them to apps/web/.env.local — copy values from your Supabase project dashboard.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    // Web uses browser localStorage for session persistence
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ----------------------------------------------------------------
// Database type helpers — mirrors schema.sql
// ----------------------------------------------------------------
export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: 'Sourdough' | 'Croissants' | 'Patisserie' | 'Beverages';
  stock: number;
  is_available: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'preparing' | 'completed' | 'cancelled';
  total_amount: number;
  payment_gateway_order_id: string | null;
  payment_id: string | null;
  delivery_type: 'pickup' | 'delivery';
  delivery_address: string | null;
  scheduled_time: string | null;
  created_at: string;
};
