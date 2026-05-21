'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function HeroSection() {
  const { scrollY } = useScroll();
  
  // Parallax calculations: Zoom background image and translate text
  const scale = useTransform(scrollY, [0, 800], [1, 1.25]);
  const y = useTransform(scrollY, [0, 800], [0, 150]);
  const textY = useTransform(scrollY, [0, 800], [0, -50]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-bakery-charcoal">
      {/* Zoom Parallax Background Image */}
      <motion.div 
        style={{ scale, y, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-bakery-charcoal/70 via-bakery-charcoal/40 to-bakery-cream z-10" />
        <img 
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=90" 
          alt="Artisanal baked sourdough textures close-up" 
          className="w-full h-full object-cover object-center select-none"
        />
      </motion.div>

      {/* Floating Flour Particles (Subtle Micro-Animation) */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-white/20 rounded-full blur-[1px] animate-pulse" />
        <div className="absolute top-[40%] right-[25%] w-1.5 h-1.5 bg-white/30 rounded-full blur-[1px] animate-pulse delay-75" />
        <div className="absolute top-[70%] left-[45%] w-3 h-3 bg-white/10 rounded-full blur-[2px] animate-pulse delay-150" />
      </div>

      {/* Hero Content */}
      <motion.div 
        style={{ y: textY, opacity }}
        className="relative z-20 text-center px-6 max-w-5xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span 
          initial={{ letterSpacing: '0.1em', opacity: 0 }}
          animate={{ letterSpacing: '0.3em', opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-bakery-gold uppercase text-xs md:text-sm font-semibold tracking-[0.3em] mb-6 block"
        >
          Slow Fermentation • Heirloom Grains
        </motion.span>
        
        <h1 className="font-serif text-5xl sm:text-7xl md:text-9xl text-bakery-cream leading-none tracking-tight mb-8">
          Baking as a <br />
          <span className="italic font-light text-bakery-wheat">Fine Art</span>
        </h1>
        
        <p className="text-bakery-wheat/80 text-base md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          Every loaf is a 36-hour slow-fermentation journey. Naturally cultivated wild yeast, organic grains, and absolute patience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.a 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            href="#bento-catalog" 
            className="bg-bakery-crust hover:bg-bakery-amber text-white px-8 py-4 rounded-full text-xs uppercase tracking-widest font-semibold transition-all shadow-lg flex items-center gap-2 group w-full sm:w-auto justify-center"
          >
            Explore Daily Loaves 
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            href="#philosophy" 
            className="border border-bakery-wheat/40 hover:border-bakery-wheat hover:bg-white/5 text-bakery-cream px-8 py-4 rounded-full text-xs uppercase tracking-widest font-semibold transition-all w-full sm:w-auto justify-center text-center"
          >
            Our Philosophy
          </motion.a>
        </div>
      </motion.div>

      {/* Decorative Bottom Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bakery-cream to-transparent z-10 pointer-events-none" />
    </section>
  );
}
