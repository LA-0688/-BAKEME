'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowLeft, Clock, Award, Compass, Heart, Activity } from 'lucide-react';

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. Scroll bindings for the overall page progress & parallax reveals
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Smooth spring-based scroll tracking for the timeline tracker line
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transformations for background decorative elements
  const wheatY1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const wheatY2 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.05]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-bakery-cream font-sans text-bakery-charcoal overflow-x-hidden"
    >
      {/* Dynamic atmospheric subtle background glows */}
      <motion.div 
        style={{ scale: bgScale }}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-bakery-wheat/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-bakery-gold/5 blur-[150px]" />
      </motion.div>

      {/* 1. STICKY GLASSMORPHISM NAVBAR */}
      <header className="sticky top-0 z-50 bg-bakery-cream/70 backdrop-blur-lg border-b border-bakery-wheat/30 px-6 py-4 flex items-center justify-between shadow-sm">
        <a 
          href="/"
          className="group flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-bakery-charcoal/80 hover:text-bakery-crust transition-all"
        >
          <motion.div
            whileHover={{ x: -3 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.div>
          Back to Store
        </a>
        <span className="font-serif text-xl tracking-wider text-bakery-charcoal select-none">
          L'ARTISAN
        </span>
        <div className="text-[9px] uppercase tracking-widest font-extrabold bg-bakery-wheat text-bakery-amber px-3 py-1 rounded-full border border-bakery-gold/20 select-none">
          Our Heritage
        </div>
      </header>

      {/* 2. LUXURIOUS STORY HERO */}
      <section className="relative z-10 pt-24 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center justify-center min-h-[70vh]">
        <motion.span 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-bakery-amber uppercase tracking-widest text-xs font-bold mb-3"
        >
          Our Core Creed
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif text-5xl md:text-7xl text-bakery-charcoal max-w-4xl leading-[1.1] tracking-tight"
        >
          Born of Flour, Water & Time.
        </motion.h1>

        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: 'easeInOut' }}
          className="h-[1px] w-24 bg-bakery-amber/55 my-8"
        />

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="text-sm sm:text-base md:text-lg text-bakery-charcoal/70 max-w-2xl font-light leading-relaxed"
        >
          At L'Artisan, we believe that fast food is an insult to the palate and the soul. 
          True flavor cannot be engineered; it must be patiently coaxed. That is why we cultivate 
          wild levain starter cultures, stonegrind organic ancient grains, and let 
          fermentation slow-bake at its own natural rhythm.
        </motion.p>
      </section>

      {/* Decorative Floating Sourdough Grain Parallax Art */}
      <motion.div 
        style={{ y: wheatY1 }}
        className="absolute top-[35%] left-[5%] hidden xl:block w-36 h-36 opacity-10 pointer-events-none"
      >
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-bakery-charcoal">
          <path d="M50,10 C53,20 53,40 50,70 C47,40 47,20 50,10 Z" />
          <path d="M50,25 C60,20 68,28 50,40 C32,28 40,20 50,25 Z" />
          <path d="M50,45 C60,40 68,48 50,60 C32,48 40,40 50,45 Z" />
        </svg>
      </motion.div>
      <motion.div 
        style={{ y: wheatY2 }}
        className="absolute top-[55%] right-[5%] hidden xl:block w-36 h-36 opacity-10 pointer-events-none"
      >
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-bakery-charcoal">
          <path d="M50,10 C53,20 53,40 50,70 C47,40 47,20 50,10 Z" />
          <path d="M50,25 C60,20 68,28 50,40 C32,28 40,20 50,25 Z" />
          <path d="M50,45 C60,40 68,48 50,60 C32,48 40,40 50,45 Z" />
        </svg>
      </motion.div>

      {/* 3. THE 24-HOUR FERMENTATION CYCLICAL TIMELINE */}
      <section className="relative z-10 py-32 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-24">
          <span className="text-bakery-amber uppercase tracking-widest text-[10px] font-extrabold mb-2 block">
            The Patient Process
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bakery-charcoal">
            The 24-Hour Sourdough Cycle
          </h2>
          <p className="text-xs sm:text-sm text-bakery-charcoal/60 mt-3 max-w-md mx-auto leading-relaxed">
            Trace the steps of the dawn bakes. Scroll down to trigger the timeline progress.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative w-full max-w-3xl mx-auto flex flex-col gap-24">
          
          {/* Hardware-accelerated dynamic scrolling progress trace line */}
          <div className="absolute left-[20px] md:left-1/2 top-4 bottom-4 w-[2px] bg-bakery-wheat/40 -translate-x-1/2 overflow-hidden">
            <motion.div 
              style={{ scaleY: smoothProgress, transformOrigin: 'top' }}
              className="w-full h-full bg-gradient-to-b from-bakery-amber via-bakery-gold to-bakery-crust shadow-[0_0_8px_rgba(223,155,71,0.5)]"
            />
          </div>

          {/* Timeline Step 1 */}
          <TimelineCard 
            index={0}
            time="04:00 AM"
            title="Sourdough Culture Awakening"
            icon={<Activity className="h-4 w-4" />}
            desc="Our baking day starts exactly where the previous left off. We feed our 15-year-old starter, levain, with dynamic stoneground organic flour and warm water, awakening deep wild bacteria cultures."
          />

          {/* Timeline Step 2 */}
          <TimelineCard 
            index={1}
            time="11:00 AM"
            title="Autolyse & Hand Kneading"
            icon={<Compass className="h-4 w-4" />}
            desc="Flour and water rest quietly during autolyse to naturally develop gluten. Then, we perform gentle stretch-and-folds by hand every half hour, trapping pockets of air for a premium high-hydration crumb."
          />

          {/* Timeline Step 3 */}
          <TimelineCard 
            index={2}
            time="06:00 PM"
            title="Overnight Cold Fermentation"
            icon={<Clock className="h-4 w-4" />}
            desc="Formed into boules and placed in custom wicker proofing bannetons, the loaves are tucked into cold retarders. Over 16 slow hours, the cool atmosphere halts yeast expansion but lets lactobacilli brew deep, sour acidity."
          />

          {/* Timeline Step 4 */}
          <TimelineCard 
            index={3}
            time="04:00 AM"
            title="Vapor Deck Oven Baking"
            icon={<Award className="h-4 w-4" />}
            desc="Under extreme heat, we score every deck load with a baker's lame to guide dynamic spring rise. Vapor is injected into heavy stone hearths, caramelizing natural crust sugars for a bold, glossy shatter."
          />

        </div>
      </section>

      {/* 4. THREE-DIMENSIONAL INGREDIENT CARD TILTS */}
      <section className="relative z-10 py-24 bg-bakery-wheat/15 border-t border-b border-bakery-wheat/20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-bakery-amber uppercase tracking-widest text-[10px] font-bold block mb-2">Our Ingredients</span>
            <h2 className="font-serif text-3xl md:text-4xl text-bakery-charcoal">Three Honest Elements</h2>
            <p className="text-xs text-bakery-charcoal/60 mt-2 max-w-sm mx-auto">Simplicity is the peak of complexity. We bake with only three components.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TiltCard 
              title="1. Wild Levain Sourdough"
              description="A living micro-ecosystem maintained for over a decade. Yields natural rising properties and beautiful lactic, digestively-friendly acidity without any chemical yeast."
              icon="🦠"
              bgGlow="from-orange-500/10 to-transparent"
            />
            <TiltCard 
              title="2. Heirloom Organic Flours"
              description="Stoneground ancient grains from local sustainable family farms. Preserves rich wheat oils, vital proteins, and structural integrity that industry rollers strip away."
              icon="🌾"
              bgGlow="from-amber-500/10 to-transparent"
            />
            <TiltCard 
              title="3. Pure Vaporized Spring"
              description="Filtered mineral spring water combined with high-pressure dry steam inside our stoneground deck ovens. Delivers the legendary caramelized crackle and high-gloss glaze."
              icon="💨"
              bgGlow="from-blue-500/10 to-transparent"
            />
          </div>
        </div>
      </section>

      {/* 5. PARALLAX "BAKER'S HANDS" IMAGE REVEAL */}
      <section className="relative z-10 py-32 px-6 max-w-5xl mx-auto flex flex-col gap-16 items-center">
        <div className="grid md:grid-cols-2 gap-16 items-center w-full">
          <div className="flex flex-col gap-6">
            <span className="text-bakery-amber uppercase tracking-widest text-xs font-bold">Tactile Artistry</span>
            <h2 className="font-serif text-4xl text-bakery-charcoal leading-tight">We Sculpt Sourdough by Hand.</h2>
            <p className="text-sm font-light text-bakery-charcoal/70 leading-relaxed">
              Every loaf is visually unique because it is carefully guided by touch. Our bakers evaluate moisture scales and surface tension by feeling the hydration pockets. We refuse to use automated assembly lines, keeping the ancient craft of baking authentic.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-bakery-charcoal/80">
              <span className="flex items-center gap-1.5 bg-bakery-wheat/40 px-3.5 py-1.5 rounded-full">
                <Heart className="h-3.5 w-3.5 text-bakery-amber" /> 100% Hand-Crafted
              </span>
              <span className="flex items-center gap-1.5 bg-bakery-wheat/40 px-3.5 py-1.5 rounded-full">
                <Award className="h-3.5 w-3.5 text-bakery-amber" /> Premium Grade
              </span>
            </div>
          </div>

          {/* Parallax layered reveal images */}
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-[32px] overflow-hidden shadow-2xl border border-bakery-wheat/40 group">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full"
            >
              <img 
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80" 
                alt="Baker dusted with flour sculpting a dough loaf"
                className="w-full h-full object-cover select-none"
              />
            </motion.div>
            
            {/* Visual warm overlay highlighting handwork */}
            <div className="absolute inset-0 bg-gradient-to-t from-bakery-crust/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <section className="relative z-10 bg-bakery-charcoal text-bakery-cream py-24 text-center px-6 overflow-hidden">
        {/* Soft atmospheric background glow inside footer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-bakery-amber/5 blur-[120px] pointer-events-none" />

        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 relative z-10">
          <span className="text-bakery-amber uppercase tracking-widest text-xs font-bold font-mono">Taste the Patient Sourdough</span>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Experience Genuine Sourdough</h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-md leading-relaxed font-light">
            Fresh loaves leave our deck ovens daily at 7:00 AM. Stop by to take home a warm country boule or try a slice of fresh, aromatic rosemary focaccia.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-bakery-amber hover:bg-bakery-gold text-white px-7 py-3.5 rounded-full transition-all shadow-md"
          >
            Order Fresh Sourdough
          </motion.a>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// TIMELINE CARD REUSABLE ANIMATED COMPONENT
// =========================================================================
interface TimelineCardProps {
  index: number;
  time: string;
  title: string;
  icon: React.ReactNode;
  desc: string;
}

function TimelineCard({ index, time, title, icon, desc }: TimelineCardProps) {
  // Stagger left/right styling on desktop based on card index
  const isEven = index % 2 === 0;

  return (
    <div className={`relative flex flex-col md:flex-row w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
      
      {/* Spacer matching left/right layout on desktop */}
      <div className="hidden md:block w-1/2" />

      {/* Circle point tracking on progress line */}
      <div className="absolute left-[20px] md:left-1/2 top-2 h-10 w-10 bg-bakery-cream border-2 border-bakery-wheat rounded-full flex items-center justify-center -translate-x-1/2 z-20 text-bakery-amber shadow-sm">
        {icon}
      </div>

      {/* Card Body */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? 40 : -40, y: 15 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-full md:w-1/2 pl-12 md:pl-0 md:px-10 z-10"
      >
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-bakery-wheat/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col gap-2.5">
          {/* Subtle colored top highlights */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-bakery-amber to-bakery-gold" />
          
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-mono font-bold tracking-widest text-bakery-amber bg-bakery-wheat/40 px-2.5 py-0.5 rounded-full">
              {time}
            </span>
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-bakery-charcoal/40">
              Stage #{index + 1}
            </span>
          </div>

          <h3 className="font-serif text-lg text-bakery-charcoal font-bold mt-1">
            {title}
          </h3>
          
          <p className="text-xs font-light text-bakery-charcoal/70 leading-relaxed">
            {desc}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// =========================================================================
// 3D PERSPECTIVE TILT CARD COMPONENT
// =========================================================================
interface TiltCardProps {
  title: string;
  description: string;
  icon: string;
  bgGlow: string;
}

function TiltCard({ title, description, icon, bgGlow }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Custom Motion values for mouse coordinates
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

  // Light spotlight coordinates tracking cursor
  const lightX = useSpring(50, { stiffness: 200, damping: 25 });
  const lightY = useSpring(50, { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative pointer offsets
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize coordinates (-0.5 to 0.5)
    const normX = (mouseX / width) - 0.5;
    const normY = (mouseY / height) - 0.5;

    // Apply max tilt (e.g. 10 degrees)
    rotateX.set(-normY * 12);
    rotateY.set(normX * 12);

    // Track spotlight relative position in percentage
    lightX.set((mouseX / width) * 100);
    lightY.set((mouseY / height) * 100);
  };

  const handleMouseLeave = () => {
    // Return smoothly to center resting state
    rotateX.set(0);
    rotateY.set(0);
    lightX.set(50);
    lightY.set(50);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-md rounded-[24px] p-8 border border-bakery-wheat/40 shadow-sm relative overflow-hidden group cursor-default flex flex-col gap-4 select-none hover:shadow-md transition-shadow"
    >
      {/* Background soft color glow */}
      <div className={`absolute -inset-px bg-gradient-to-b ${bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      {/* Dynamic spot-light overlay tracking mouse cursor */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle 120px at ${lightX}% ${lightY}%, rgba(223,155,71,0.06), transparent)`
        }}
      />

      <span className="text-4xl filter drop-shadow-sm select-none pointer-events-none">
        {icon}
      </span>
      
      <h3 className="font-serif text-lg text-bakery-charcoal font-bold mt-2 transform-style-3d group-hover:translate-z-10 transition-transform duration-300">
        {title}
      </h3>
      
      <p className="text-xs font-light text-bakery-charcoal/70 leading-relaxed transform-style-3d group-hover:translate-z-5 transition-transform duration-300">
        {description}
      </p>
    </motion.div>
  );
}
