import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// ------------------------------------------------------------
// Platform-aware Supabase Auth storage adapter.
//
// On iOS/Android  → expo-secure-store (native keychain/keystore)
//   Tokens persist securely between app launches.
//
// On Web/Node SSR → localStorage when available, or a no-op
//   in-memory store as a safe fallback during server rendering.
//   (Expo Router runs SSR in Node.js which has no native modules.)
// ------------------------------------------------------------
const createStorageAdapter = () => {
  if (Platform.OS !== 'web') {
    // Native: lazy-require so the Node SSR bundle never touches SecureStore
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store');
    return {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  }

  // Web / Node.js SSR — use localStorage when available, else a safe no-op store
  if (typeof localStorage !== 'undefined') {
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }

  // Node.js SSR with no localStorage — in-memory no-op (tokens won't persist, fine for SSR)
  const memStore = new Map<string, string>();
  return {
    getItem: (key: string) => Promise.resolve(memStore.get(key) ?? null),
    setItem: (key: string, value: string) => { memStore.set(key, value); return Promise.resolve(); },
    removeItem: (key: string) => { memStore.delete(key); return Promise.resolve(); },
  };
};

const ExpoSecureStoreAdapter = createStorageAdapter();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Create a .env file in apps/mobile/ with your project credentials.'
  );
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  auth: {
    storage: ExpoSecureStoreAdapter,
    // autoRefreshToken = true ensures the JWT is refreshed BEFORE it expires.
    // This prevents any session interruption during checkout flows.
    autoRefreshToken: true,
    persistSession: true,
    // detectSessionInUrl must be false in React Native — Expo Router handles
    // deep-link OTP magic links via the 'lartisan://' scheme instead.
    detectSessionInUrl: false,
  },
});
