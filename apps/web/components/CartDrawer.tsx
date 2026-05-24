'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { CartEntry } from '../store/cartStore';

function CartItemImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    const initial = alt ? alt[0].toUpperCase() : 'B';
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-bakery-wheat to-bakery-gold/25 border border-bakery-wheat/40 flex items-center justify-center font-serif font-bold text-bakery-amber text-lg select-none shrink-0">
        {initial}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-16 h-16 rounded-2xl object-cover border border-bakery-wheat/40 shrink-0"
    />
  );
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartEntry[];
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, cart, onRemove, onCheckout }: CartDrawerProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Shadow overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Cart Sliding Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bakery-cream border-l border-bakery-wheat/40 shadow-2xl z-50 p-6 sm:p-8 flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-center border-b border-bakery-wheat/60 pb-5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-bakery-wheat rounded-full text-bakery-crust">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-bakery-charcoal">Your Basket</h3>
                </div>
                <motion.button 
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-bakery-wheat/60 transition-colors text-bakery-charcoal/70"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Shopping List Container */}
              <div className="space-y-5 max-h-[62vh] overflow-y-auto pr-1 select-none">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 flex flex-col items-center gap-4 text-bakery-charcoal/40"
                  >
                    <ShoppingBag className="h-12 w-12 stroke-1" />
                    <p className="font-light text-sm">Your basket is currently empty.</p>
                    <button 
                      onClick={onClose}
                      className="bg-bakery-charcoal text-white hover:bg-bakery-crust px-6 py-3 rounded-full text-xs uppercase tracking-wider font-semibold transition-all mt-4"
                    >
                      Start Browsing
                    </button>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div 
                        key={item.product.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-4 border-b border-bakery-wheat/30 pb-5 items-center justify-between"
                      >
                        <div className="flex gap-4 items-center">
                          <CartItemImage
                            src={item.product.image_url ?? ''}
                            alt={item.product.name}
                          />
                          <div>
                            <h4 className="font-serif text-base text-bakery-charcoal leading-tight font-bold">{item.product.name}</h4>
                            <span className="text-[10px] text-bakery-amber uppercase tracking-wider font-bold block mt-1">{item.product.category}</span>
                            <span className="text-xs text-bakery-charcoal/60 mt-1 block">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRemove(item.product.id)}
                            className="text-bakery-charcoal/30 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                          <span className="font-serif text-base font-bold text-bakery-charcoal">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Checkouts Panel */}
            {cart.length > 0 && (
              <div className="border-t border-bakery-wheat/60 pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-bakery-charcoal/70">Subtotal</span>
                  <span className="font-serif text-2xl font-bold text-bakery-charcoal">₹{subtotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-bakery-charcoal/50 leading-relaxed mb-6 font-light">
                  Tax and pickup options computed at final checkout stage. State synched instantly across all devices.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  className="w-full bg-bakery-crust hover:bg-bakery-amber text-white py-4 rounded-full text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

