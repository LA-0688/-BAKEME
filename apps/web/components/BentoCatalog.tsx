'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ImageOff, Loader2 } from 'lucide-react';
import { type Product } from '../lib/supabase';
import { type CartProduct } from '../store/cartStore';

interface BentoCatalogProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart: (product: CartProduct) => void;
}

function CatalogImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (error || !src) {
    return (
      <div className={`w-full h-full min-h-[220px] bg-gradient-to-tr from-bakery-wheat/80 via-bakery-cream to-bakery-gold/20 flex flex-col items-center justify-center p-4 border border-bakery-wheat/30 select-none text-center ${className}`}>
        <span className="font-serif text-4xl font-bold text-bakery-amber tracking-widest mb-2 drop-shadow-sm">{initials}</span>
        <span className="text-[9px] uppercase tracking-widest font-bold text-bakery-charcoal/50 bg-white/70 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-bakery-wheat/30">
          <ImageOff className="h-3 w-3 text-bakery-amber/70" /> Baked Fresh
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-bakery-wheat/20 animate-pulse flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 text-bakery-amber animate-spin" />
        </div>
      )}
      <motion.img
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        src={src}
        alt={alt}
        className="w-full h-full object-cover origin-center"
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}

function SkeletonCard({ className }: { className: string }) {
  return (
    <div className={`${className} bg-bakery-wheat/30 rounded-[32px] animate-pulse`} />
  );
}

function toCartProduct(p: Product): CartProduct {
  return { id: p.id, name: p.name, price: p.price, image_url: p.image_url, category: p.category };
}

function formatCategory(category: string): string {
  if (category === 'Croissants') return 'Specialty Breads';
  return category;
}

export default function BentoCatalog({ products, isLoading = false, onAddToCart }: BentoCatalogProps) {
  // Animation states for bento items
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="bento-catalog" className="py-28 px-6 bg-bakery-wheat/20 border-y border-bakery-wheat/40 relative">
      {/* Decorative Warm Accents */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-bakery-wheat/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-bakery-crust/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-bakery-amber uppercase tracking-[0.25em] text-xs font-bold block mb-3"
          >
            Freshly Baked Daily
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl text-bakery-charcoal"
          >
            The Daily Counter
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.2 }}
            className="text-bakery-charcoal/60 mt-4 max-w-md mx-auto font-light text-sm"
          >
            Explore our curated small-batch breads, hand-rolled pastries, and classic beverages. Click an item to add it to your synchronized basket.
          </motion.p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {isLoading ? (
            <>
              <SkeletonCard className="md:col-span-8 h-80" />
              <SkeletonCard className="md:col-span-4 h-80" />
              <SkeletonCard className="md:col-span-4 h-72" />
              <SkeletonCard className="md:col-span-8 h-72" />
            </>
          ) : (
            <>

          {/* Card 1: Hero product (Landscape - 8 Columns) */}
          {products[0] && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="md:col-span-8 bg-bakery-cream rounded-[32px] overflow-hidden shadow-sm hover:shadow-md border border-bakery-wheat/40 flex flex-col md:flex-row group transition-all duration-300"
            >
              <div className="md:w-1/2 relative overflow-hidden h-72 md:h-auto flex">
                <CatalogImage
                  src={products[0].image_url ?? ''}
                  alt={products[0].name}
                  className="w-full h-full"
                />
                <span className="absolute top-6 left-6 bg-bakery-charcoal text-white text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full font-semibold shadow-sm z-15">
                  Best Seller
                </span>
              </div>
              <div className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <span className="text-bakery-amber uppercase tracking-widest text-[11px] font-bold block mb-3">{formatCategory(products[0].category)}</span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-bakery-charcoal mb-4 group-hover:text-bakery-crust transition-colors">
                    {products[0].name}
                  </h3>
                  <p className="text-bakery-charcoal/70 text-sm font-light leading-relaxed mb-6">
                    {products[0].description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-serif text-2xl sm:text-3xl text-bakery-charcoal font-bold">
                    ₹{products[0].price.toFixed(2)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onAddToCart(toCartProduct(products[0]))}
                    className="bg-bakery-charcoal hover:bg-bakery-crust text-white px-6 py-3 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Card 2: Portrait - 4 Columns */}
          {products[1] && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="md:col-span-4 bg-bakery-cream rounded-[32px] overflow-hidden shadow-sm hover:shadow-md border border-bakery-wheat/40 flex flex-col group p-6 transition-all duration-300"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-6 flex">
                <CatalogImage
                  src={products[1].image_url ?? ''}
                  alt={products[1].name}
                  className="w-full h-full"
                />
              </div>
              <div className="flex flex-col flex-grow justify-between">
                <div>
                  <span className="text-bakery-amber uppercase tracking-widest text-[11px] font-bold block mb-3">{formatCategory(products[1].category)}</span>
                  <h3 className="font-serif text-xl sm:text-2xl text-bakery-charcoal mb-3 group-hover:text-bakery-crust transition-colors">
                    {products[1].name}
                  </h3>
                  <p className="text-bakery-charcoal/70 text-xs font-light leading-relaxed mb-6">
                    {products[1].description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-serif text-2xl text-bakery-charcoal font-bold">
                    ₹{products[1].price.toFixed(2)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onAddToCart(toCartProduct(products[1]))}
                    className="bg-bakery-charcoal hover:bg-bakery-crust text-white p-3 rounded-full text-xs uppercase tracking-wider font-semibold transition-all"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Card 3: Portrait - 4 Columns */}
          {products[2] && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="md:col-span-4 bg-bakery-cream rounded-[32px] overflow-hidden shadow-sm hover:shadow-md border border-bakery-wheat/40 flex flex-col group p-6 transition-all duration-300"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-6 flex">
                <CatalogImage
                  src={products[2].image_url ?? ''}
                  alt={products[2].name}
                  className="w-full h-full"
                />
              </div>
              <div className="flex flex-col flex-grow justify-between">
                <div>
                  <span className="text-bakery-amber uppercase tracking-widest text-[11px] font-bold block mb-3">{formatCategory(products[2].category)}</span>
                  <h3 className="font-serif text-xl sm:text-2xl text-bakery-charcoal mb-3 group-hover:text-bakery-crust transition-colors">
                    {products[2].name}
                  </h3>
                  <p className="text-bakery-charcoal/70 text-xs font-light leading-relaxed mb-6">
                    {products[2].description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-serif text-2xl text-bakery-charcoal font-bold">
                    ₹{products[2].price.toFixed(2)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onAddToCart(toCartProduct(products[2]))}
                    className="bg-bakery-charcoal hover:bg-bakery-crust text-white p-3 rounded-full text-xs uppercase tracking-wider font-semibold transition-all"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Card 4: Landscape - 8 Columns */}
          {products[3] && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="md:col-span-8 bg-bakery-cream rounded-[32px] overflow-hidden shadow-sm hover:shadow-md border border-bakery-wheat/40 flex flex-col md:flex-row group transition-all duration-300"
            >
              <div className="md:w-1/2 relative overflow-hidden h-72 md:h-auto flex">
                <CatalogImage
                  src={products[3].image_url ?? ''}
                  alt={products[3].name}
                  className="w-full h-full"
                />
              </div>
              <div className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <span className="text-bakery-amber uppercase tracking-widest text-[11px] font-bold block mb-3">{formatCategory(products[3].category)}</span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-bakery-charcoal mb-4 group-hover:text-bakery-crust transition-colors">
                    {products[3].name}
                  </h3>
                  <p className="text-bakery-charcoal/70 text-sm font-light leading-relaxed mb-6">
                    {products[3].description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-serif text-2xl sm:text-3xl text-bakery-charcoal font-bold">
                    ₹{products[3].price.toFixed(2)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onAddToCart(toCartProduct(products[3]))}
                    className="bg-bakery-charcoal hover:bg-bakery-crust text-white px-6 py-3 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

            </>
          )}

        </div>

        {/* Secondary Dynamic Grid for Additional Products */}
        {products.length > 4 && (
          <div className="mt-24 border-t border-bakery-wheat/30 pt-20">
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-bakery-amber uppercase tracking-[0.25em] text-[10px] font-extrabold block mb-2"
              >
                Specialty Collections
              </motion.span>
              <h3 className="font-serif text-3xl sm:text-4xl text-bakery-charcoal">
                More Counter Specials
              </h3>
              <p className="text-bakery-charcoal/60 mt-3 max-w-sm mx-auto font-light text-xs">
                Handcrafted small-batch bakes, sweet patisserie, and curated beverage pairings.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(4).map((product, idx) => (
                <motion.div
                  key={product.id || idx}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  className="bg-bakery-cream rounded-[32px] overflow-hidden shadow-sm hover:shadow-md border border-bakery-wheat/40 flex flex-col group p-6 transition-all duration-300"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-6 flex">
                    <CatalogImage
                      src={product.image_url ?? ''}
                      alt={product.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col flex-grow justify-between">
                    <div>
                      <span className="text-bakery-amber uppercase tracking-widest text-[11px] font-bold block mb-3">
                        {formatCategory(product.category)}
                      </span>
                      <h4 className="font-serif text-xl sm:text-2xl text-bakery-charcoal mb-3 group-hover:text-bakery-crust transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-bakery-charcoal/70 text-xs font-light leading-relaxed mb-6">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-serif text-2xl text-bakery-charcoal font-bold">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onAddToCart(toCartProduct(product))}
                        className="bg-bakery-charcoal hover:bg-bakery-crust text-white p-3 rounded-full text-xs uppercase tracking-wider font-semibold transition-all"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
