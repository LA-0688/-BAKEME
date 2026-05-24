'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, RefreshCw, User, LogOut, Lock, X } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import BentoCatalog from '../components/BentoCatalog';
import CartDrawer from '../components/CartDrawer';
import SyncDemo from '../components/SyncDemo';
import AuthModal from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';
import { JigglingLoaf, FallingSlices } from '../components/InteractiveBread';
import AdminDashboard from '../components/AdminDashboard';
import { useCartStore, type CartProduct } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import { supabase, type Product } from '../lib/supabase';

export default function HomePage() {
  const { user, signOut } = useAuth();
  const { items, addItem, removeItem, totalItems } = useCartStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('synced');

  // Admin access control states
  const [isAdminView, setIsAdminView] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Live products from Supabase — falls back to hardcoded if DB not configured yet
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      }

      // Filter out actual croissants, duplicate sourdoughs, and USD-priced template products
      const dbProducts = (data || []).filter((p) => {
        const isCroissantCategory = p.category === 'Croissants';
        const isActualCroissant = isCroissantCategory && !p.name.toLowerCase().includes('focaccia');
        const hasCroissantInName = p.name.toLowerCase().includes('croissant');
        
        // Exclude duplicate country sourdough items to keep catalog clean
        const isDuplicateCountrySourdough = p.name.toLowerCase().includes('country sourdough') || p.name.toLowerCase().includes('sourdough country');
        
        // Exclude low-priced USD template bakes (under ₹50.00)
        const isUSDTemplateProduct = p.price < 50;

        return !isActualCroissant && !hasCroissantInName && !isDuplicateCountrySourdough && !isUSDTemplateProduct;
      });

      // Merge FALLBACK_PRODUCTS with database products, ensuring signature ones are at the front
      const merged = [...FALLBACK_PRODUCTS];

      // Append database products that are not already in FALLBACK_PRODUCTS
      dbProducts.forEach((dbProd) => {
        const exists = FALLBACK_PRODUCTS.some(
          (sig) => sig.name.toLowerCase() === dbProd.name.toLowerCase()
        );
        if (!exists) {
          merged.push(dbProd);
        }
      });

      setProducts(merged as unknown as Product[]);
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to signature local catalog:', err);
      setProducts(FALLBACK_PRODUCTS as unknown as Product[]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    let productsSubscription: any = null;
    try {
      // Setup live subscription to the products table for customer instant updates
      productsSubscription = supabase
        .channel('realtime_storefront_products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          fetchProducts();
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription failed:', err);
    }

    return () => {
      if (productsSubscription) {
        try {
          supabase.removeChannel(productsSubscription);
        } catch (err) {
          console.warn('Remove realtime subscription failed:', err);
        }
      }
    };
  }, []);

  const handleAddToCart = (product: CartProduct) => {
    addItem(product);
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('synced'), 900);
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1830') {
      setIsPasscodeModalOpen(false);
      setPasscode('');
      setPasscodeError('');
      setIsAdminView(true);
      
      // Auto-upgrade user profile to Admin in backend for seamless database operations
      try {
        const sessionToken = localStorage.getItem('sb-kimmnbpopbmutkowdssa-auth-token');
        const token = sessionToken ? JSON.parse(sessionToken)?.access_token : null;
        if (token) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', currentUser.id);
          }
        }
      } catch (err) {
        console.error('Admin role upgrade warning:', err);
      }
    } else {
      setPasscodeError('Invalid Passcode. Access Denied.');
    }
  };

  const cartCount = totalItems();

  // ─── RENDER MERCHANT ADMIN WORKSPACE DIRECTLY ─────────────────
  if (isAdminView) {
    return <AdminDashboard onBack={() => setIsAdminView(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-bakery-cream selection:bg-bakery-wheat selection:text-bakery-amber overflow-x-hidden font-sans">
      
      {/* 0. FLOATING PARALLAX BACKGROUND BREAD SLICES */}
      <FallingSlices />

      {/* 1. PREMIUM HEADER / NAV */}
      <header className="sticky top-0 z-40 bg-bakery-cream/80 backdrop-blur-md border-b border-bakery-wheat/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-2xl tracking-wider text-bakery-charcoal select-none">
            L'ARTISAN
          </span>
          <span className="text-[10px] uppercase tracking-widest font-semibold bg-bakery-wheat text-bakery-amber px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Supabase Live
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-bakery-charcoal/80 font-medium">
          <a href="/about" className="hover:text-bakery-crust transition-colors">About Us</a>
          <a href="#philosophy" className="hover:text-bakery-crust transition-colors">Philosophy</a>
          <a href="#bento-catalog" className="hover:text-bakery-crust transition-colors">Our Catalog</a>
          <a href="#sync-demo" className="hover:text-bakery-crust transition-colors">Mobile Sync</a>
        </nav>

        <div className="flex items-center gap-4">
          {/* Sync Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-bakery-charcoal/60 select-none">
            <motion.div
              animate={syncStatus === 'syncing' ? { rotate: 360 } : {}}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <RefreshCw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'text-bakery-crust' : 'text-green-600'}`} />
            </motion.div>
            <span className="capitalize font-medium">{syncStatus === 'syncing' ? 'Syncing...' : 'Synced'}</span>
          </div>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-bakery-charcoal/60 hidden sm:block max-w-[120px] truncate">
                {user.email}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="p-2.5 rounded-full bg-bakery-wheat/70 text-bakery-charcoal/70 hover:bg-red-50 hover:text-red-500 transition-all"
                title="Sign out"
                id="sign-out-btn"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest bg-bakery-wheat text-bakery-charcoal px-4 py-2 rounded-full hover:bg-bakery-crust hover:text-white transition-all"
              id="sign-in-btn"
            >
              <User className="h-3.5 w-3.5" />
              Sign In
            </motion.button>
          )}

          {/* Cart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-full bg-bakery-wheat text-bakery-charcoal hover:bg-bakery-crust hover:text-white transition-all shadow-sm flex items-center justify-center"
            id="cart-btn"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-bakery-crust text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-bakery-cream"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <HeroSection />

      {/* 2.5 PREMIUM JAPANESE SHOKUPAN SHOWROOM */}
      <section className="bg-bakery-cream border-b border-bakery-wheat/20 py-20 px-6 flex flex-col items-center justify-center text-center relative z-20">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-bakery-amber uppercase tracking-widest text-[10px] font-extrabold mb-2 block">
            Signature Baking Art
          </span>
          <h3 className="font-serif text-3xl md:text-4xl text-bakery-charcoal mb-4">
            Pillowy Soft Japanese Milk Bread
          </h3>
          <p className="text-xs sm:text-sm text-bakery-charcoal/60 max-w-lg mb-4 font-light leading-relaxed">
            Our legendary Japanese Shokupan milk bread is baked fresh at 4 AM every morning. Made with organic cream, sweet honey, and imported Japanese wheat, its high-hydration crumb yields a cloud-like texture that melts in your mouth.
          </p>
          <JigglingLoaf />
        </div>
      </section>

      {/* 3. PHILOSOPHY SECTION */}
      <section id="philosophy" className="py-28 px-6 max-w-7xl mx-auto relative z-20">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[32px] shadow-xl border border-bakery-wheat/40">
              <img
                src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80"
                alt="Baker handling sourdough wheat flour"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 select-none"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-bakery-wheat p-6 rounded-2xl max-w-[240px] shadow-lg border border-bakery-gold/20">
              <span className="font-serif text-3xl text-bakery-amber block font-bold">100%</span>
              <span className="text-xs text-bakery-charcoal uppercase tracking-wider font-semibold block mt-1">Naturally Fermented</span>
              <p className="text-[11px] text-bakery-charcoal/70 mt-2">No commercial yeast. Just wild sourdough culture, flour, salt, and water.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <span className="text-bakery-amber uppercase tracking-widest text-xs font-bold">Traditional Methods</span>
            <h2 className="font-serif text-4xl md:text-5xl text-bakery-charcoal leading-tight">
              Slow Dough, Rich Crust, True Flavor.
            </h2>
            <p className="text-bakery-charcoal/80 leading-relaxed font-light text-sm sm:text-base">
              By utilizing long hydration periods and letting nature work at its own pace, we unlock deep lactic acidity and tender textures that modern, high-speed bread-making completely ignores.
            </p>
            <ul className="space-y-4 text-sm mt-2 font-medium">
              {['Stoneground organic heritage grains', 'High-hydration (80%+) interior crumb structure', 'Vapor-injected custom deck ovens'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-5 w-5 bg-bakery-wheat text-bakery-amber rounded-full flex items-center justify-center font-bold text-xs select-none">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 4. ASYMMETRICAL BENTO GRID CATALOG */}
      <BentoCatalog
        products={products}
        isLoading={productsLoading}
        onAddToCart={handleAddToCart}
      />

      {/* 5. SYNC DEMO NATIVE SIMULATOR */}
      <SyncDemo cart={items} />

      {/* 6. FOOTER */}
      <footer className="bg-bakery-charcoal/5 border-t border-bakery-wheat/40 py-20 px-6 text-bakery-charcoal/80 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col gap-4">
            <span className="font-serif text-2xl tracking-wider text-bakery-charcoal">L'ARTISAN</span>
            <p className="text-xs leading-relaxed font-light text-bakery-charcoal/60">
              Heirloom fermentation, natural sourdoughs, pastries, and house roasted specialty beverage components. Baked every morning at 4:00 AM.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-4">Daily Bake Hours</h4>
            <ul className="text-xs font-light space-y-2 text-bakery-charcoal/60">
              <li>Monday – Friday: 7:00 AM – 3:00 PM</li>
              <li>Saturday – Sunday: 8:00 AM – 4:00 PM</li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-4">Locations</h4>
            <ul className="text-xs font-light space-y-2 text-bakery-charcoal/60">
              <li>104 Craft Bread Blvd, Suite A</li>
              <li>Saint-Honoré Quarter</li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-4">Admin Dashboard</h4>
            <p className="text-xs font-light text-bakery-charcoal/60 mb-3">Login to customize daily recipes and bakes.</p>
            <button
              onClick={() => {
                setPasscode('');
                setPasscodeError('');
                setIsPasscodeModalOpen(true);
              }}
              className="text-[10px] font-bold font-mono bg-bakery-wheat text-bakery-amber px-3.5 py-1.5 rounded-full uppercase tracking-wider hover:bg-bakery-amber hover:text-white transition-all shadow-sm"
            >
              Access Restricted
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-bakery-wheat/20 mt-12 pt-8 text-center text-[10px] text-bakery-charcoal/40 uppercase tracking-widest font-semibold">
          © {new Date().getFullYear()} L'Artisan Bakery. Crafted for visual excellence.
        </div>
      </footer>

      {/* ANIMATED CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={items}
        onRemove={removeItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* OTP AUTH MODAL */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* SECURE CHECKOUT & PAYMENT DRAWER */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={items}
        totalAmount={items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}
        onSuccess={async () => {
          // Clear Zustand store local cart items
          useCartStore.getState().clearCart();
          // Clear Supabase DB cart items if user is logged in
          const userId = useCartStore.getState().userId;
          if (userId) {
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', userId);
          }
        }}
      />

      {/* SECURE PASSCODE GATED ACCESS DIALOG */}
      <AnimatePresence>
        {isPasscodeModalOpen && (
          <>
            {/* Dark Frosted Glass Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasscodeModalOpen(false)}
              className="fixed inset-0 z-50 bg-bakery-charcoal/50 backdrop-blur-md flex items-center justify-center px-4"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-bakery-cream rounded-3xl p-8 border border-bakery-wheat/40 shadow-2xl"
            >
              <button
                onClick={() => setIsPasscodeModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-bakery-wheat/40 text-bakery-charcoal/55 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center gap-5">
                <div className="h-12 w-12 bg-bakery-wheat/35 rounded-full flex items-center justify-center text-bakery-amber shadow-sm">
                  <Lock className="h-5 w-5" />
                </div>
                
                <div>
                  <h3 className="font-serif text-xl text-bakery-charcoal font-bold">Enter Admin Passcode</h3>
                  <p className="text-[10px] text-bakery-charcoal/55 uppercase font-bold tracking-widest mt-1">
                    Authenticating Bakery Merchant
                  </p>
                </div>

                <form onSubmit={handlePasscodeSubmit} className="w-full flex flex-col gap-4">
                  <div className="flex flex-col gap-1 text-left">
                    <input
                      type="password"
                      required
                      autoFocus
                      placeholder="••••"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setPasscodeError('');
                      }}
                      className="w-full bg-bakery-wheat/30 border border-bakery-wheat/60 focus:border-bakery-crust rounded-2xl px-4 py-3.5 text-center text-lg font-bold tracking-[0.6em] outline-none text-bakery-charcoal transition-all"
                    />
                    {passcodeError && (
                      <span className="text-[10px] font-bold text-red-500 mt-1 block text-center">
                        {passcodeError}
                      </span>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-bakery-crust hover:bg-bakery-amber text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all"
                  >
                    Unlock Workspace
                  </motion.button>
                </form>

                <span className="text-[9px] text-bakery-charcoal/40 font-semibold uppercase tracking-widest">
                  Hint: enter 1830 to unlock
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// ─── Fallback until Supabase is seeded ───────────────────────────
const FALLBACK_PRODUCTS = [
  {
    id: 'sourdough-country-loaf',
    name: 'Sourdough Country Loaf',
    price: 290.00,
    category: 'Sourdough',
    image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=800',
    description: '36-hour slow-fermented heirloom wheat, bold caramelized crust, airy open crumb, and robust wild levain tang.',
    is_available: true,
    stock: 12,
    created_at: '',
  },
  {
    id: 'sprouted-ragi-sourdough',
    name: 'Sprouted Ragi Sourdough',
    price: 240.00,
    category: 'Sourdough',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    description: 'Deeply nutritious sprouted finger millet (Ragi) sourdough, dense mineral-rich crumb, earthy rustic aroma, and complex whole-grain notes.',
    is_available: true,
    stock: 15,
    created_at: '',
  },
  {
    id: 'multi-millet-gf-sourdough',
    name: 'Multi Millet Gluten Free Sourdough',
    price: 260.00,
    category: 'Sourdough',
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800',
    description: 'Crafted with ancient superfood millets: sorghum, pearl millet, and amaranth. Fully gluten-free with a delicate moist interior and toasted gold crust.',
    is_available: true,
    stock: 10,
    created_at: '',
  },
  {
    id: 'sourdough-focaccia',
    name: 'Sourdough Focaccia',
    price: 180.00,
    image_url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=800',
    description: 'Naturally fermented sheet-baked focaccia infused with organic extra virgin olive oil, fresh hand-picked rosemary, and coarse sea salt crystals.',
    is_available: true,
    stock: 8,
    created_at: '',
  },
];


