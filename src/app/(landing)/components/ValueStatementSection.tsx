"use client";

import { motion, useAnimation, useInView, AnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";

interface ParticleProps {
  id: number;
  controls: AnimationControls;
  baseDuration: number;
  baseXOffset: number;
}

interface FloatingParticlesProps {
  count: number;
  isInView: boolean;
}

const Particle = ({ id, controls, baseDuration, baseXOffset }: ParticleProps) => {
  const size = Math.random() * 6 + 2;
  const duration = baseDuration * (0.7 + Math.random() * 0.6);
  const delay = Math.random() * 2; // Start with a small delay
  const left = Math.random() * 100;
  const startY = 100 + Math.random() * 20;
  const opacity = Math.random() * 0.3 + 0.1;
  const color = Math.random() > 0.5 ? "#5afcc0" : "#ffffff";
  const xOffset = baseXOffset * (0.3 + Math.random() * 0.4); // More controlled x movement
  
  // Ensure all CSS properties use camelCase format for React
  const particleStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    left: `${left}%`,
    top: `${startY}%`,
    zIndex: 0,
    position: 'absolute',
    borderRadius: '50%',
    willChange: 'transform, opacity',
  };
  
  return (
    <motion.div
      style={particleStyle}
      animate={controls}
      custom={{ duration, delay, xOffset, opacity }}
      variants={{
        hidden: {
          y: 0,
          x: 0,
          opacity: 0,
          transition: { duration: 0.5 }
        },
        visible: (custom) => ({
          y: -150, // Reduced travel distance
          x: custom.xOffset,
          opacity: [0, custom.opacity, 0],
          transition: {
            duration: custom.duration,
            delay: custom.delay,
            ease: [0.16, 1, 0.3, 1],
            times: [0, 0.3, 1],
          },
        }),
      }}
    />
  );
};

const FloatingParticles = ({ count = 15, isInView }: FloatingParticlesProps) => {
  const controls = useAnimation();
  const particles = Array.from({ length: count });
  const baseDuration = 6; // Reduced base duration
  const baseXOffset = 30; // Reduced horizontal movement
  const isAnimating = useRef(false);
  
  useEffect(() => {
    if (isInView && !isAnimating.current) {
      isAnimating.current = true;
      
      // Initial animation
      controls.start("visible");
      
      // Slow down after initial animation
      const slowDown = () => {
        controls.start({
          y: -150,
          transition: {
            duration: baseDuration * 1.5,
            ease: [0.16, 1, 0.3, 1],
          },
        });
      };
      
      const timer = setTimeout(slowDown, 1500);
      
      return () => {
        clearTimeout(timer);
        isAnimating.current = false;
      };
    } else if (!isInView) {
      controls.start("hidden");
    }
  }, [isInView, controls, baseDuration]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <Particle 
          key={i} 
          id={i}
          controls={controls}
          baseDuration={baseDuration}
          baseXOffset={baseXOffset}
        />
      ))}
    </div>
  );
};

export default function ValueStatementSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  
  return (
    <section 
      ref={ref}
      className="relative py-24 md:py-32 bg-black text-white overflow-hidden"
    >
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 z-0" style={{
        background: 'radial-gradient(circle at center, rgba(10,10,10,0.9) 0%, rgba(0,0,0,0.95) 100%)',
      }} />
      
      {/* Floating particles */}
      <FloatingParticles count={20} isInView={isInView} />
      
      <div className="max-w-4xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10 text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-bold mb-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          An AI tool that doesn't just automate shorts,<br />it makes them <span className="text-[#5afcc0] text-5xl md:text-7xl font-extrabold inline-block px-2">SELL</span>.
        </motion.h2>
      </div>
    </section>
  );
}
