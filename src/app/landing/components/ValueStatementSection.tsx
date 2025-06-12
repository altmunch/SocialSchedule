"use client";

import { motion, useAnimation, useInView, AnimationControls } from "framer-motion";
import { useEffect, useRef, useMemo } from "react";

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
  const delay = Math.random() * 2;
  const left = Math.random() * 100;
  const startY = 100 + Math.random() * 20;
  const opacity = Math.random() * 0.3 + 0.1;
  const color = Math.random() > 0.5 ? "#5afcc0" : "#ffffff";
  const xOffset = baseXOffset * (0.3 + Math.random() * 0.4);
  
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
    pointerEvents: 'none',
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
          transition: { 
            duration: 0.5,
            ease: 'easeOut'
          }
        },
        visible: (custom) => ({
          y: -150,
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
  const particles = useMemo(() => Array.from({ length: count }), [count]);
  const baseDuration = 6;
  const baseXOffset = 30;
  const isAnimating = useRef(false);
  
  useEffect(() => {
    if (!isInView) {
      controls.start("hidden");
      isAnimating.current = false;
      return;
    }
    
    if (!isAnimating.current) {
      isAnimating.current = true;
      
      // Initial animation
      controls.start("visible");
      
      // Continuous animation
      const animateParticles = () => {
        controls.start({
          y: -150,
          opacity: [0, 0.2, 0],
          transition: {
            duration: baseDuration * (0.7 + Math.random() * 0.6),
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: 0.5
          },
        });
      };
      
      const timer = setTimeout(animateParticles, 1500);
      
      return () => {
        clearTimeout(timer);
        isAnimating.current = false;
      };
    }
  }, [isInView, controls, baseDuration]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_: unknown, i: number) => (
        <Particle 
          key={`particle-${i}`}
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
        <a href="/dashboard">
          <button className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-5 rounded-lg font-bold text-lg shadow-xl shadow-[#8D5AFF]/30 hover:from-purple-700 hover:to-indigo-700 transition-all">
            Get Started
          </button>
        </a>
      </div>
    </section>
  );
}
