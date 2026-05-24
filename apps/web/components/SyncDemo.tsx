'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShoppingBag } from 'lucide-react';
import { type CartProduct } from '../store/cartStore';

interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface SyncDemoProps {
  cart: CartItem[];
}

export default function SyncDemo({ cart }: SyncDemoProps) {
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <section id="sync-demo" className="py-28 px-6 bg-bakery-charcoal text-bakery-cream relative overflow-hidden">
      {/* Immersive Glowing Orbs */}
      <div className="absolute top-0 right-0 h-96 w-96 bg-bakery-crust/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-96 w-96 bg-bakery-gold/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* Left Column: Descriptions */}
        <div className="flex flex-col gap-6">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-bakery-gold uppercase tracking-widest text-xs font-bold"
          >
            Real-time Cloud Sync
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl leading-tight"
          >
            One Shared Basket. <br />
            <span className="text-bakery-gold italic">Any Device.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-bakery-cream/70 font-light leading-relaxed text-sm"
          >
            We leverage live cloud infrastructure. When you add standard products or modify checkout orders here on the web browser, your basket instantly reflects on our **Native Mobile App**. Start browsing on your desktop, checkout seamlessly on your phone.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-4 mt-6"
          >
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-bakery-gold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white">Secure OTP Authentication</h4>
              <p className="text-xs text-bakery-cream/50 mt-1 max-w-sm font-light">
                One-click passwordless session token management syncs user permissions flawlessly across multiple environments.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Simulated Smartphone Sandbox */}
        <div className="flex justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-[300px] h-[550px] bg-black rounded-[48px] p-3.5 shadow-2xl border-[4px] border-neutral-800 relative overflow-hidden"
          >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20 flex justify-center items-center">
              <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1" />
            </div>

            {/* Simulated Smartphone Screen OS */}
            <div className="w-full h-full bg-[#1C160E] rounded-[36px] p-4 pt-8 flex flex-col justify-between overflow-hidden relative select-none">
              
              {/* Phone Status / Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 mt-2">
                <span className="font-serif text-xs tracking-widest text-white">L'Artisan Native</span>
                <div className="flex items-center gap-1.5 text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Live
                </div>
              </div>

              {/* Real-time Synced Content Body */}
              <div className="flex-grow overflow-y-auto space-y-3.5 custom-scrollbar pr-0.5">
                <span className="text-[10px] text-bakery-gold uppercase tracking-wider font-semibold block">Synced Cart ({cart.length})</span>
                
                {cart.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-white/10 rounded-2xl p-4">
                    <ShoppingBag className="h-6 w-6 text-white/20" />
                    <p className="text-[11px] text-white/40 font-light">Add items on the website to see them sync live here!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div 
                        key={item.product.id}
                        initial={{ opacity: 0, x: -15, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 15, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <img src={item.product.image_url ?? ''} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <p className="text-[10px] font-semibold text-white truncate max-w-[110px]">{item.product.name}</p>
                            <p className="text-[8px] text-white/50">₹{item.product.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-serif text-bakery-gold font-bold">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Total & Checkout Handoff */}
              {cart.length > 0 && (
                <div className="border-t border-white/10 pt-3 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-white/60">Cart Total</span>
                    <span className="font-serif text-sm text-bakery-gold font-bold">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-bakery-gold hover:bg-white text-[#1C160E] py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all text-center"
                  >
                    Pay via UPI / GPay

                  </motion.button>
                </div>
              )}

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
