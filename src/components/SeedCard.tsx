import React, { useState } from "react";
import { Heart, Copy, Check, Trash2, Calendar, User, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { StorySeed, Writer } from "../types";

interface SeedCardProps {
  seed: StorySeed;
  currentWriter: Writer | null;
  onLikeToggle: (seedId: string) => void;
  onDelete: (seedId: string) => void;
  key?: string;
}

export default function SeedCard({ seed, currentWriter, onLikeToggle, onDelete }: SeedCardProps) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(seed.seedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const isLiked = currentWriter ? seed.likedBy?.includes(currentWriter.writerId) : false;
  const isOwner = currentWriter && seed.creatorWriterId === currentWriter.writerId;

  // Formatting date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "Unknown date";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800/80"
      id={`seed-card-${seed.id}`}
    >
      {/* Accent color strip based on Genre */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
        seed.genre.includes("Sci-Fi") ? "from-indigo-500 to-cyan-400" :
        seed.genre.includes("Fantasy") ? "from-amber-400 to-orange-500" :
        seed.genre.includes("Mystery") ? "from-purple-600 to-pink-500" :
        seed.genre.includes("Horror") ? "from-rose-700 to-red-500" :
        seed.genre.includes("Romance") ? "from-rose-400 to-pink-500" :
        "from-slate-500 to-slate-700"
      }`} />

      {/* Meta Header badges */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/40 dark:border-slate-700/50">
            {seed.genre}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/20 dark:border-amber-900/20">
            {seed.emotionalTone}
          </span>
        </div>

        {/* Setting title */}
        <h4 className="text-sm font-semibold font-display text-slate-700 dark:text-slate-300 mb-2 leading-snug">
          Setting: {seed.setting}
        </h4>

        {/* The Seed Text itself (rendered elegantly) */}
        <div className="relative mb-6">
          <span className="absolute -top-4 -left-3 text-5xl font-serif text-slate-100 dark:text-slate-800/40 select-none">“</span>
          <p className="text-slate-800 dark:text-slate-200 text-sm font-serif italic leading-relaxed relative z-10 whitespace-pre-line pl-1">
            {seed.seedText}
          </p>
          <span className="absolute -bottom-10 -right-2 text-5xl font-serif text-slate-100 dark:text-slate-800/40 select-none">”</span>
        </div>

        {/* Additional custom ideas weaving if exists */}
        {seed.additionalIdeas && (
          <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Custom ideas incorporated:</span> "{seed.additionalIdeas}"
          </div>
        )}
      </div>

      {/* Card Footer details */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1">
            <User size={12} />
            <span className="font-medium text-slate-600 dark:text-slate-400 max-w-[120px] truncate">
              {seed.creatorName || "Anonymous Writer"} 
              {seed.creatorWriterId && ` (${seed.creatorWriterId})`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(seed.createdAt)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy Seed to Clipboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            id={`copy-btn-${seed.id}`}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>

          {/* Like Button */}
          <button
            onClick={() => onLikeToggle(seed.id)}
            title={currentWriter ? "Like Seed" : "Sign In to Like Seeds"}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
              isLiked 
                ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30" 
                : "text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/10"
            }`}
            id={`like-btn-${seed.id}`}
          >
            <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
            <span>{seed.likes || 0}</span>
          </button>

          {/* Owner delete button */}
          {isOwner && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this story seed?")) {
                  onDelete(seed.id);
                }
              }}
              title="Delete Seed"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-colors cursor-pointer"
              id={`delete-btn-${seed.id}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
