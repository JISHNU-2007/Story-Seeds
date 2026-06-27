import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Feather, BookOpen, Sparkles } from "lucide-react";

export default function FloatingThoughts() {
  // Memoize elements and paths so they don't regenerate or cause jumpy animations on re-renders
  const thoughts = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const size = Math.random() * 6 + 4;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 20 + 20;
      const delay = Math.random() * -30;
      const opacity = Math.random() * 0.35 + 0.15;
      
      // Infinite continuous random bezier coordinate drifts
      const pathX = [0, Math.random() * 120 - 60, Math.random() * 120 - 60, Math.random() * 120 - 60, 0];
      const pathY = [0, Math.random() * 120 - 60, Math.random() * 120 - 60, Math.random() * 120 - 60, 0];
      
      return {
        id: `thought-${i}`,
        size,
        x,
        y,
        pathX,
        pathY,
        duration,
        delay,
        opacity,
      };
    });
  }, []);

  const sparkles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `sparkle-${i}`,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 80 + 10}%`,
      size: Math.random() * 12 + 10,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * -15,
    }));
  }, []);

  const flyingPages = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const x = Math.random() * 100;
      const size = Math.random() * 18 + 12;
      const duration = Math.random() * 25 + 20;
      const delay = Math.random() * -40;
      const rotation = Math.random() * 360;
      return {
        id: `page-${i}`,
        x,
        size,
        duration,
        delay,
        rotation,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" id="floating-muses-container">
      {/* Shifting Multicolored Background Auroras & Waves (like the screenshot UI) */}
      <div className="aurora-bg-mesh">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
        <div className="aurora-wave-belt" />
      </div>

      {/* Moving Cosmic Thought Particles */}
      {thoughts.map((thought) => (
        <motion.div
          key={thought.id}
          className="absolute rounded-full bg-amber-400/20 blur-[1px] dark:bg-amber-400/35"
          style={{
            width: thought.size,
            height: thought.size,
            left: `${thought.x}%`,
            top: `${thought.y}%`,
          }}
          animate={{
            x: thought.pathX,
            y: thought.pathY,
            scale: [1, 1.3, 0.8, 1.2, 1],
            opacity: [thought.opacity, thought.opacity * 1.6, thought.opacity * 0.4, thought.opacity * 1.2, thought.opacity],
          }}
          transition={{
            duration: thought.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: thought.delay,
          }}
        />
      ))}

      {/* Floating Sparkles (Muses) */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute text-amber-500/20 dark:text-amber-400/40"
          style={{
            left: sparkle.left,
            top: sparkle.top,
          }}
          animate={{
            scale: [0.5, 1.2, 0.6, 1.1, 0.5],
            opacity: [0.1, 0.5, 0.2, 0.6, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: sparkle.delay,
          }}
        >
          <Sparkles size={sparkle.size} />
        </motion.div>
      ))}

      {/* Floating Parchment Pages / Book Icons */}
      {flyingPages.map((page, index) => {
        const Icon = index % 2 === 0 ? Feather : BookOpen;
        return (
          <motion.div
            key={page.id}
            className="absolute text-slate-300/10 dark:text-amber-500/5 flex items-center justify-center"
            style={{
              left: `${page.x}%`,
              width: page.size,
              height: page.size,
            }}
            initial={{ y: "120vh", rotate: page.rotation, opacity: 0 }}
            animate={{
              y: "-20vh",
              x: ["0px", "40px", "-40px", "20px", "0px"],
              rotate: [page.rotation, page.rotation + 180, page.rotation + 360],
              opacity: [0, 0.35, 0.35, 0.15, 0],
            }}
            transition={{
              y: {
                duration: page.duration,
                repeat: Infinity,
                ease: "linear",
                delay: page.delay,
              },
              x: {
                duration: page.duration / 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: page.duration,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: {
                duration: page.duration,
                repeat: Infinity,
                ease: "linear",
              }
            }}
          >
            <Icon size={page.size} className="transform -skew-x-12" />
          </motion.div>
        );
      })}
    </div>
  );
}
