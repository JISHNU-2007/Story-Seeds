import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, VolumeX, Sparkles, Compass, Feather, BookOpen, Layers } from "lucide-react";

export default function BackgroundMovie() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Loop timer: 0 to 20 seconds
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= 19.9) {
          return 0; // loop back to 0
        }
        return Number((prev + 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Current Act based on 20-second timeline
  const currentAct = useMemo(() => {
    if (seconds < 5) return 1;   // Act I: Cosmic Spark
    if (seconds < 10) return 2;  // Act II: Roots of Narrative
    if (seconds < 15) return 3;  // Act III: Whispers of Muses
    return 4;                    // Act IV: The Story Blooms
  }, [seconds]);

  // Subtitles for each act
  const actSubtitles = {
    1: "Act I: Sowing the Cosmic Spark. An idea drifts in the dark void of imagination.",
    2: "Act II: Branching Roots. Narrative conflict seeks depth, anchoring the world.",
    3: "Act III: Whispering Muses. Setting, genre, and emotional tone take theatrical shape.",
    4: "Act IV: Sown in the Conservatory. The seeds sprout. Your masterpiece awaits."
  };

  // Generate stable random particles for background
  const seedsOfLight = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `seed-${i}`,
      left: `${15 + Math.random() * 70}%`,
      startY: 100 + Math.random() * 20,
      scale: 0.5 + Math.random() * 0.8,
      speed: 3 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.5,
    }));
  }, []);

  const literaryStars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: `star-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#02050c]" id="background-movie-container">
      {/* 20-Second Dynamic Color Gradient Backdrop */}
      <motion.div
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        animate={{
          background: 
            currentAct === 1 
              ? "radial-gradient(circle at 50% 60%, rgba(30, 41, 59, 0.4) 0%, rgba(2, 5, 12, 1) 100%)"
              : currentAct === 2
              ? "radial-gradient(circle at 30% 40%, rgba(13, 148, 136, 0.15) 0%, rgba(2, 5, 12, 1) 80%)"
              : currentAct === 3
              ? "radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.08) 40%, rgba(2, 5, 12, 1) 100%)"
              : "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.12) 0%, rgba(2, 5, 12, 1) 90%)"
        }}
      />

      {/* BACKGROUND GRAPHIC NOVEL GRID ACCENT */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* STATIC LITERARY STARS */}
      {literaryStars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* ================= ACT I: COSMIC SPARK (0s - 5s) ================= */}
      {currentAct === 1 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Central Pulsing Cosmic Core */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 0.95, 1.1, 0.8],
              opacity: [0.4, 0.85, 0.6, 0.9, 0.4] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-72 h-72 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/10 to-transparent blur-3xl"
          />

          {/* Floating Seeds Drifting Upwards */}
          {seedsOfLight.map((seed, idx) => (
            <motion.div
              key={seed.id}
              className="absolute bg-gradient-to-t from-amber-400 to-rose-400 rounded-full blur-[1px] shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              style={{
                left: seed.left,
                width: seed.scale * 10,
                height: seed.scale * 10,
                opacity: seed.opacity,
              }}
              initial={{ y: "110vh", scale: seed.scale }}
              animate={{ 
                y: "-10vh",
                x: [0, Math.sin(idx) * 50, -Math.sin(idx) * 50, 0]
              }}
              transition={{ 
                duration: seed.speed, 
                repeat: Infinity, 
                ease: "linear",
                delay: idx * 0.3
              }}
            />
          ))}
        </div>
      )}

      {/* ================= ACT II: THE ROOTS (5s - 10s) ================= */}
      {currentAct === 2 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animated SVG Branching Tree Roots */}
          <svg className="w-full h-full absolute opacity-40" viewBox="0 0 1000 1000" fill="none">
            {/* Left root path */}
            <motion.path
              d="M 500,200 C 450,350 300,450 200,600 C 120,720 180,850 100,950"
              stroke="url(#root-grad-teal)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 4, ease: "easeOut" }}
            />
            {/* Center root path */}
            <motion.path
              d="M 500,200 C 500,400 550,550 520,700 C 480,850 550,900 500,990"
              stroke="url(#root-grad-gold)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 4, ease: "easeOut", delay: 0.5 }}
            />
            {/* Right root path */}
            <motion.path
              d="M 500,200 C 550,350 700,450 800,600 C 880,720 820,850 900,950"
              stroke="url(#root-grad-teal)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 4, ease: "easeOut", delay: 0.2 }}
            />

            <defs>
              <linearGradient id="root-grad-teal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1"/>
              </linearGradient>
              <linearGradient id="root-grad-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Glowing Word Nodes forming along roots */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute top-[35%] left-[25%] bg-teal-950/80 border border-teal-500/30 text-teal-300 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider"
          >
            CONFLICT
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute top-[55%] left-[70%] bg-amber-950/80 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider"
          >
            MYSTERY
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ delay: 2.8, duration: 1 }}
            className="absolute top-[75%] left-[45%] bg-rose-950/80 border border-rose-500/30 text-rose-300 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider"
          >
            TENSION
          </motion.div>
        </div>
      )}

      {/* ================= ACT III: THE WHISPERS (10s - 15s) ================= */}
      {currentAct === 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Swirling Runes/Words orbit */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="relative w-96 h-96 border border-slate-800/10 rounded-full flex items-center justify-center"
          >
            {/* Glowing orbit icons */}
            <div className="absolute top-0 text-amber-400/80 animate-pulse"><Feather size={28} /></div>
            <div className="absolute bottom-0 text-indigo-400/80 animate-pulse"><BookOpen size={28} /></div>
            <div className="absolute left-0 text-rose-400/80 animate-pulse"><Sparkles size={28} /></div>
            <div className="absolute right-0 text-teal-400/80 animate-pulse"><Compass size={28} /></div>

            {/* Glowing characters drifting in orbit */}
            <span className="absolute top-12 left-12 text-sm font-serif font-semibold text-slate-400">A</span>
            <span className="absolute bottom-16 right-16 text-sm font-serif font-semibold text-slate-500">Ω</span>
            <span className="absolute top-20 right-12 text-xs font-mono text-amber-500/40">✎</span>
            <span className="absolute bottom-20 left-24 text-sm font-serif font-semibold text-slate-400">§</span>
          </motion.div>

          {/* Atmospheric Vortex Glow */}
          <motion.div
            animate={{ 
              scale: [0.9, 1.15, 0.9],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 blur-2xl"
          />
        </div>
      )}

      {/* ================= ACT IV: THE BLOOM (15s - 20s) ================= */}
      {currentAct === 4 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Cosmic shockwave ripple */}
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 3.5, ease: "easeOut" }}
            className="w-60 h-60 rounded-full border border-amber-400/40 bg-amber-500/5 blur-[2px]"
          />

          {/* Shimmering Golden Flare */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 0.7, 0.3, 0],
              scale: [0.5, 1.4, 1.2, 1]
            }}
            transition={{ duration: 4.5, ease: "easeInOut" }}
            className="w-[500px] h-[500px] rounded-full bg-gradient-to-r from-amber-400/15 via-rose-500/10 to-indigo-600/10 blur-3xl"
          />

          {/* Blooming sparkling bursts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="text-amber-400/30 font-serif italic text-lg tracking-widest text-center"
          >
            S O W  Y O U R  S T O R Y
          </motion.div>
        </div>
      )}

      {/* ================= CINEMATIC SUBTITLES OVERLAY ================= */}
      <div className="absolute bottom-24 left-0 right-0 z-10 flex justify-center px-4">
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-full px-6 py-2.5 max-w-xl text-center backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentAct}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-[11px] sm:text-xs font-serif italic tracking-wide text-amber-200/90"
            >
              {actSubtitles[currentAct as keyof typeof actSubtitles]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* ================= CINEMA CONTROLS PLAYER WIDGET ================= */}
      {/* Set pointer-events-auto so the user can interact with the widget! */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto" id="cinema-widget-controller">
        <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-4 shadow-xl shadow-black/80 backdrop-blur-md">
          {/* Movie Badge Indicator */}
          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-lg animate-pulse">
            <Layers size={10} />
            <span>App Film Loop</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Audio/Play Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title={isPlaying ? "Pause Movie Background" : "Play Movie Background"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="text-amber-400 fill-amber-400" />}
            </button>
            <button
              onClick={() => { setSeconds(0); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Reset Film"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Time & Timeline */}
          <div className="flex flex-col gap-1 w-28 sm:w-36">
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
              <span className="font-semibold text-amber-400">
                {currentAct === 1 ? "I: Cosmic" : currentAct === 2 ? "II: Roots" : currentAct === 3 ? "III: Muses" : "IV: Bloom"}
              </span>
              <span>0:{seconds.toFixed(0).padStart(2, "0")} / 0:20</span>
            </div>
            {/* Timeline Progress Bar */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 transition-all duration-100" 
                style={{ width: `${(seconds / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
