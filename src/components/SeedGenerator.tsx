import React, { useState, useEffect } from "react";
import { Sparkles, Feather, HelpCircle, AlertCircle, RefreshCw, Type, ChevronRight, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GENRES_WITH_SETTINGS, EMOTIONAL_TONES, Writer, StorySeed } from "../types";

interface SeedGeneratorProps {
  currentWriter: Writer | null;
  onSeedGenerated: (newSeed: StorySeed) => void;
  onOpenAuth: () => void;
}

export default function SeedGenerator({ currentWriter, onSeedGenerated, onOpenAuth }: SeedGeneratorProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("Sci-Fi");
  const [customGenre, setCustomGenre] = useState<string>("");
  const [isCustomGenreActive, setIsCustomGenreActive] = useState<boolean>(false);

  const [selectedSetting, setSelectedSetting] = useState<string>("");
  const [customSetting, setCustomSetting] = useState<string>("");
  const [isCustomSettingActive, setIsCustomSettingActive] = useState<boolean>(false);

  const [selectedTone, setSelectedTone] = useState<string>(EMOTIONAL_TONES[0]);
  const [customTone, setCustomTone] = useState<string>("");
  const [isCustomToneActive, setIsCustomToneActive] = useState<boolean>(false);

  const [additionalIdeas, setAdditionalIdeas] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Loading quotes or progress statements
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingPhrases = [
    "Consulting the celestial archives...",
    "Brewing dramatic tension...",
    "Threading the sensory atmosphere...",
    "Engraving the seed into parchment...",
    "Polishing the final wordcraft..."
  ];

  // Automatically select the first default setting when the genre changes
  useEffect(() => {
    if (!isCustomGenreActive && selectedGenre !== "Other") {
      const settings = GENRES_WITH_SETTINGS[selectedGenre as keyof typeof GENRES_WITH_SETTINGS];
      if (settings && settings.length > 0) {
        setSelectedSetting(settings[0]);
        setIsCustomSettingActive(false);
      }
    } else {
      setSelectedSetting("");
      setIsCustomSettingActive(true);
    }
  }, [selectedGenre, isCustomGenreActive]);

  // Loading animation quote rotator
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingPhrases.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const genre = isCustomGenreActive ? (customGenre.trim() || "Custom Genre") : selectedGenre;
    const setting = isCustomSettingActive ? (customSetting.trim() || "Custom Setting") : selectedSetting;
    const tone = isCustomToneActive ? (customTone.trim() || "Custom Tone") : selectedTone;

    if (!genre || !setting || !tone) {
      setError("Please fill in or select all required parameters.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/generate-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          setting,
          emotionalTone: tone,
          additionalIdeas,
          writerId: currentWriter ? currentWriter.writerId : null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate story seed.");
      }

      onSeedGenerated(data);
      // Reset additional ideas for next prompt
      setAdditionalIdeas("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const activeSettings = !isCustomGenreActive && selectedGenre !== "Other" 
    ? GENRES_WITH_SETTINGS[selectedGenre as keyof typeof GENRES_WITH_SETTINGS] 
    : [];

  return (
    <div className="w-full bg-[#0a0f1d]/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl relative" id="seed-generator-box">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-800/80">
        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Craft a New Seed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set up the theatrical scene and let the AI compile a compelling prompt.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-start gap-3" id="generator-error-msg">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-semibold text-rose-200">Generation Halted:</span> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6 sm:space-y-8">
        
        {/* SECTION 1: GENRE SELECTION */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">1</span>
              Choose Genre
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomGenreActive(!isCustomGenreActive);
                setCustomGenre("");
              }}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Type size={12} />
              {isCustomGenreActive ? "Use Preset Genres" : "Write Custom Genre"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isCustomGenreActive ? (
              <motion.div
                key="custom-genre-input"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="relative"
              >
                <input
                  type="text"
                  required
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Enter your custom genre (e.g. Solarpunk Detective, Mythic Realism)..."
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                />
              </motion.div>
            ) : (
              <motion.div
                key="preset-genre-selector"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                {Object.keys(GENRES_WITH_SETTINGS).map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left relative cursor-pointer ${
                      selectedGenre === genre && !isCustomGenreActive
                        ? "bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white border-transparent shadow-lg shadow-rose-500/20"
                        : "bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 2: SETTING SELECTION */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">2</span>
              Choose Setting
            </label>
            {!isCustomGenreActive && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomSettingActive(!isCustomSettingActive);
                  setCustomSetting("");
                }}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Compass size={12} />
                {isCustomSettingActive ? "Use Preset Settings" : "Write Custom Setting"}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isCustomSettingActive || isCustomGenreActive ? (
              <motion.div
                key="custom-setting-input"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="relative"
              >
                <textarea
                  required
                  value={customSetting}
                  onChange={(e) => setCustomSetting(e.target.value)}
                  placeholder="Describe your custom setting (e.g. A rusting train station suspended between floating clouds)..."
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium resize-none transition-all"
                />
              </motion.div>
            ) : (
              <motion.div
                key="preset-setting-selector"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 gap-2"
              >
                {activeSettings.map((setting) => (
                  <button
                    key={setting}
                    type="button"
                    onClick={() => setSelectedSetting(setting)}
                    className={`px-4 py-3 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                      selectedSetting === setting && !isCustomSettingActive
                        ? "bg-slate-900 border-amber-500/80 text-amber-400 shadow-md"
                        : "bg-slate-900/60 text-slate-300 border-slate-800/80 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <span>{setting}</span>
                    <ChevronRight size={14} className={selectedSetting === setting ? "opacity-100 text-amber-400" : "opacity-0"} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 3: EMOTIONAL TONE */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">3</span>
              Choose Emotional Tone
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomToneActive(!isCustomToneActive);
                setCustomTone("");
              }}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Type size={12} />
              {isCustomToneActive ? "Use Presets" : "Write Custom Tone"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isCustomToneActive ? (
              <motion.div
                key="custom-tone-input"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <input
                  type="text"
                  required
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                  placeholder="Enter your custom tone (e.g. Paranoid & Frenzied, Ethereal & Melancholy)..."
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                />
              </motion.div>
            ) : (
              <motion.div
                key="preset-tone-selector"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
              >
                {EMOTIONAL_TONES.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={`px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition-all text-center leading-tight flex items-center justify-center min-h-[44px] cursor-pointer ${
                      selectedTone === tone && !isCustomToneActive
                        ? "bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 text-white border-transparent shadow-md"
                        : "bg-slate-900/60 text-slate-300 border-slate-800/80 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 4: ADDITIONAL IDEAS */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">4</span>
            Weave Custom Ideas (Optional)
          </label>
          <textarea
            value={additionalIdeas}
            onChange={(e) => setAdditionalIdeas(e.target.value)}
            placeholder="Type extra instructions, character hints, or specific plot points you want to weave in (e.g. 'incorporate a recurring mechanical ticking sound', 'must include an old librarian who has lost her memory')..."
            rows={3}
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
          />
        </div>

        {/* SUBMIT SECTION WITH STYLE & ANIMATION */}
        <div className="pt-4 border-t border-slate-800/60 flex flex-col items-center">
          {!currentWriter && (
            <p className="text-xs text-slate-400 mb-4 text-center">
              Generating as an <strong>Anonymous Writer</strong>. 
              <button 
                type="button" 
                onClick={onOpenAuth}
                className="text-amber-400 font-semibold hover:underline ml-1 cursor-pointer animate-pulse"
              >
                Sign up / Sign in
              </button> to save seeds to your profile and build a writer portfolio.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full max-w-sm py-4 px-8 rounded-full font-bold font-display text-white transition-all shadow-lg flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer ${
              loading 
                ? "bg-slate-800 cursor-not-allowed shadow-none" 
                : "bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:shadow-xl hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98]"
            }`}
            id="generate-seed-btn"
          >
            {/* Shimmer/shine hover effect */}
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />

            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin text-amber-400" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm font-medium text-white"
                  >
                    {loadingPhrases[loadingStep]}
                  </motion.span>
                </AnimatePresence>
              </>
            ) : (
              <>
                <Feather size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-base tracking-wide uppercase text-white">Generate Story Seed</span>
                <Sparkles size={18} className="animate-pulse" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
