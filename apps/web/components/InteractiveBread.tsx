'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

// =========================================================================
// 1. PREMIUM STATIC SHOKUPAN LOAF SHOWROOM
// =========================================================================
export function JigglingLoaf() {
  const { addItem } = useCartStore();

  const handleBuy = () => {
    addItem({
      id: 'japanese-shokupan-loaf',
      name: 'Pillowy Japanese Milk Bread',
      price: 220.00,
      image_url: '/japanese_bread.png',
      category: 'Sourdough'
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-8 select-none pointer-events-auto w-full max-w-md mx-auto">
      {/* Warm Golden Glow Aura behind the bread to make it look heavenly */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-bakery-wheat/40 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Main Bread Loaf Glassmorphic Display Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -6 }}
        className="relative z-10 w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl border border-bakery-wheat/40 bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-sm p-3 group cursor-pointer transition-all duration-500"
      >
        <div className="w-full h-full rounded-[32px] overflow-hidden relative">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            src="/japanese_bread.png" 
            alt="Freshly Baked Japanese Shokupan Milk Bread"
            className="w-full h-full object-cover select-none"
          />
          {/* Subtle Warm Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-bakery-charcoal/20 via-transparent to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />
        </div>
      </motion.div>

      {/* Premium Buying Section */}
      <div className="relative z-10 flex flex-col items-center mt-6 w-full gap-4">
        <div className="flex items-center gap-4">
          <span className="font-serif text-3xl font-bold text-bakery-charcoal">
            ₹220.00
          </span>
          <span className="text-[10px] uppercase tracking-widest font-extrabold bg-bakery-wheat text-bakery-amber px-2.5 py-1 rounded-full border border-bakery-amber/20 select-none">
            Freshly Baked 4:00 AM
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBuy}
          className="w-full sm:w-auto bg-bakery-charcoal hover:bg-bakery-crust text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-md flex items-center justify-center gap-2"
          id="buy-shokupan-btn"
        >
          <ShoppingBag className="h-4 w-4" />
          Buy Fresh Loaf Instantly
        </motion.button>
      </div>

      {/* Cloud-like soft premium label */}
      <span className="text-[10px] text-bakery-charcoal/50 uppercase tracking-widest font-bold mt-6 bg-bakery-wheat/40 px-3.5 py-1.5 rounded-full border border-bakery-wheat/30 select-none">
        Signature Japanese Milk Bread (Shokupan)
      </span>
    </div>
  );
}

// =========================================================================
// 2. PARALLAX FALLING SLICES (DISABLED AS PER REQUEST)
// =========================================================================
export function FallingSlices() {
  return null;
}

