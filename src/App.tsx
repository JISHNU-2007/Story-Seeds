import React, { useState, useEffect, useRef } from "react";
import { 
  Feather, 
  Sparkles, 
  User, 
  LogOut, 
  Search, 
  BookMarked, 
  Heart, 
  Compass, 
  ArrowDown, 
  Check, 
  Copy, 
  Mail, 
  Phone, 
  Calendar,
  ChevronDown,
  Info,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Writer, StorySeed, GENRES_WITH_SETTINGS } from "./types";
import AuthModal from "./components/AuthModal";
import SeedGenerator from "./components/SeedGenerator";
import SeedCard from "./components/SeedCard";

export default function App() {
  const [currentWriter, setCurrentWriter] = useState<Writer | null>(null);
  const [seeds, setSeeds] = useState<StorySeed[]>([]);
  const [activeTab, setActiveTab] = useState<"community" | "my-seeds">("community");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // UI Modals / Drawer toggles
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<"signin" | "signup">("signin");
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Success alert toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const generatorSectionRef = useRef<HTMLDivElement>(null);

  // Load writer session and community seeds on boot
  useEffect(() => {
    // 1. Session load
    const saved = localStorage.getItem("story_seeds_writer");
    if (saved) {
      try {
        setCurrentWriter(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved writer", e);
      }
    }

    // 2. Fetch all story seeds
    fetchSeeds();
  }, []);

  const fetchSeeds = async () => {
    try {
      const response = await fetch("/api/seeds");
      if (response.ok) {
        const data = await response.json();
        setSeeds(data);
      }
    } catch (err) {
      console.error("Failed to fetch seeds:", err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAuthSuccess = (writer: Writer) => {
    setCurrentWriter(writer);
    localStorage.setItem("story_seeds_writer", JSON.stringify(writer));
    showToast(`Welcome back, Writer ${writer.name}!`);
    fetchSeeds(); // reload seeds to account for owns/likes
  };

  const handleLogout = () => {
    setCurrentWriter(null);
    localStorage.removeItem("story_seeds_writer");
    setProfileDrawerOpen(false);
    showToast("Logged out of Writing Sanctuary.");
  };

  const handleLikeToggle = async (seedId: string) => {
    if (!currentWriter) {
      setAuthModalInitialTab("signin");
      setAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/seeds/${seedId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerId: currentWriter.writerId })
      });

      if (response.ok) {
        const updatedSeed = await response.json();
        setSeeds(prev => prev.map(s => s.id === seedId ? updatedSeed : s));
      }
    } catch (err) {
      console.error("Error liking seed:", err);
    }
  };

  const handleDeleteSeed = async (seedId: string) => {
    if (!currentWriter) return;

    try {
      const response = await fetch(`/api/seeds/${seedId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerId: currentWriter.writerId })
      });

      if (response.ok) {
        setSeeds(prev => prev.filter(s => s.id !== seedId));
        showToast("Story seed deleted successfully.");
      }
    } catch (err) {
      console.error("Error deleting seed:", err);
    }
  };

  const handleNewSeedGenerated = (newSeed: StorySeed) => {
    setSeeds(prev => [newSeed, ...prev]);
    showToast("A new Story Seed has been sown in your conservatory!");
    
    // Auto switch to My Seeds if they generated it as logged in
    if (currentWriter) {
      setActiveTab("my-seeds");
    } else {
      setActiveTab("community");
    }

    // Scroll to the seed section smoothly
    const scrollTarget = document.getElementById("seeds-section");
    if (scrollTarget) {
      scrollTarget.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToGenerator = () => {
    if (generatorSectionRef.current) {
      generatorSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenAuthTab = (tab: "signin" | "signup") => {
    setAuthModalInitialTab(tab);
    setAuthModalOpen(true);
  };

  // Filter and search logic
  const filteredSeeds = seeds.filter(seed => {
    // 1. Tab filtering
    if (activeTab === "my-seeds") {
      if (!currentWriter || seed.creatorWriterId !== currentWriter.writerId) {
        return false;
      }
    }

    // 2. Genre filtering
    if (selectedGenreFilter !== "All" && seed.genre !== selectedGenreFilter) {
      return false;
    }

    // 3. Search query filtering (by text, setting, creator or tone)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const textMatch = seed.seedText.toLowerCase().includes(query);
      const settingMatch = seed.setting.toLowerCase().includes(query);
      const toneMatch = seed.emotionalTone.toLowerCase().includes(query);
      const creatorMatch = seed.creatorName ? seed.creatorName.toLowerCase().includes(query) : false;
      
      return textMatch || settingMatch || toneMatch || creatorMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans antialiased relative overflow-x-hidden selection:bg-amber-100 selection:text-slate-900">
      
      {/* Decorative Warm Backlighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20" />
      <div className="absolute top-[800px] left-0 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-[100px] pointer-events-none -ml-40" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/80 backdrop-blur-md border-b border-slate-200/40 px-4 sm:px-8 py-4 flex items-center justify-between" id="app-header">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center shadow-md">
            <Feather size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight font-display text-slate-950">Story Seeds</span>
        </div>

        {/* Profile & Auth Status Top Right */}
        <div className="flex items-center gap-3">
          {currentWriter ? (
            <button
              onClick={() => setProfileDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200/50 cursor-pointer"
              id="header-profile-btn"
            >
              <div className="w-6 h-6 bg-slate-900 text-amber-300 rounded-full flex items-center justify-center font-bold text-xs">
                {currentWriter.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                {currentWriter.name}
              </span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAuthTab("signin")}
                className="text-xs font-semibold px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
                id="header-signin-btn"
              >
                Sign In
              </button>
              <button
                onClick={() => handleOpenAuthTab("signup")}
                className="text-xs font-bold px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
                id="header-signup-btn"
              >
                Become a Writer
              </button>
            </div>
          )}
        </div>
      </header>

      {/* TOAST NOTIFICATION CONTAINER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-slate-900 text-white text-xs font-medium shadow-xl flex items-center gap-2 border border-slate-800"
            id="toast-notification"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-12 sm:gap-16">
        
        {/* HERO SECTION / FRONT PAGE INTRO */}
        <section className="text-center py-10 sm:py-16 max-w-3xl mx-auto flex flex-col items-center gap-6" id="hero-intro-section">
          {/* Glowing artistic badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 font-mono text-[10px] tracking-wider uppercase font-bold"
          >
            <Sparkles size={12} className="animate-spin-slow" />
            Empowering the Literary Mind
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display text-slate-950 tracking-tight leading-none"
          >
            Sow the Seeds of <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600">Dramatic Tension</span>
              <span className="absolute left-0 right-0 bottom-1 h-2 bg-amber-200/40 -z-0" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 font-serif leading-relaxed"
          >
            "Story Seeds are short, one-paragraph descriptions of a community, place or situation with some dramatic tension already baked in - ready to kickstart your writing!"
          </motion.p>

          {/* LARGE STYLIZED CREATE A STORY BUTTON WITH ANIMATION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 flex flex-col items-center gap-4"
          >
            <button
              onClick={scrollToGenerator}
              className="px-10 py-5 rounded-full bg-slate-950 text-white font-bold font-display shadow-2xl hover:shadow-amber-500/10 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 border border-slate-800 text-base relative overflow-hidden cursor-pointer"
              id="hero-create-story-btn"
            >
              {/* Highlight flash */}
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
              <Feather size={20} className="text-amber-400" />
              <span>CREATE A STORY SEED</span>
              <ArrowDown size={18} className="animate-bounce" />
            </button>

            {/* Below the button login options as requested */}
            {!currentWriter ? (
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span>First time?</span>
                <button 
                  onClick={() => handleOpenAuthTab("signup")}
                  className="font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                  id="hero-signup-shortcut"
                >
                  Join the Guild (Sign Up)
                </button>
                <span className="mx-1">•</span>
                <button 
                  onClick={() => handleOpenAuthTab("signin")}
                  className="font-bold text-slate-800 hover:text-slate-900 underline cursor-pointer"
                  id="hero-signin-shortcut"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Authenticated as <strong className="text-slate-800">{currentWriter.name} ({currentWriter.writerId})</strong>
              </p>
            )}
          </motion.div>
        </section>

        {/* INTERACTIVE COMPOSER SECTION */}
        <section 
          ref={generatorSectionRef} 
          className="scroll-mt-24" 
          id="composer-section"
        >
          <div className="max-w-4xl mx-auto">
            <SeedGenerator 
              currentWriter={currentWriter}
              onSeedGenerated={handleNewSeedGenerated}
              onOpenAuth={() => handleOpenAuthTab("signup")}
            />
          </div>
        </section>

        {/* SEED EXPLORATION GALLERY SECTION */}
        <section className="scroll-mt-24 border-t border-slate-200/60 pt-12" id="seeds-section">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
                <BookMarked size={22} className="text-amber-500" />
                The Conservatory
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore atmospheric story seeds cataloged by other guild wordsmiths.
              </p>
            </div>

            {/* Tabs (Community / My Seeds) */}
            <div className="flex p-1 bg-slate-100 rounded-xl max-w-fit border border-slate-200/30">
              <button
                onClick={() => setActiveTab("community")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "community"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="community-tab-btn"
              >
                <Compass size={14} />
                <span>Community Seeds</span>
              </button>
              <button
                onClick={() => {
                  if (!currentWriter) {
                    showToast("Please sign in to view your personalized seeds catalog.");
                    handleOpenAuthTab("signin");
                    return;
                  }
                  setActiveTab("my-seeds");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "my-seeds"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="my-seeds-tab-btn"
              >
                <Feather size={14} />
                <span>My Saved Seeds</span>
              </button>
            </div>
          </div>

          {/* Filtering, Searching UI Panel */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100/80 shadow-sm flex flex-col md:flex-row gap-4 items-center mb-8">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search seeds by text, setting, tone, creator..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
              />
            </div>

            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs text-slate-400 mr-2 font-medium">Filter:</span>
              {["All", ...Object.keys(GENRES_WITH_SETTINGS)].map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenreFilter(genre)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedGenreFilter === genre
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                  id={`genre-filter-${genre}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Grid display of Story Seeds */}
          <AnimatePresence mode="popLayout">
            {filteredSeeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="seeds-grid">
                {filteredSeeds.map((seed) => (
                  <SeedCard
                    key={seed.id}
                    seed={seed}
                    currentWriter={currentWriter}
                    onLikeToggle={handleLikeToggle}
                    onDelete={handleDeleteSeed}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto"
                id="no-seeds-view"
              >
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-4">
                  <Info size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-800">No Story Seeds Cataloged</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {searchQuery 
                    ? "We couldn't find any seeds matching your active search query." 
                    : "Be the first to generate a seed with those specific parameters and enrich the archive!"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedGenreFilter("All"); }}
                    className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="mt-20 border-t border-slate-200/40 bg-[#FAF9F5] px-4 py-8 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Story Seeds Guild. Inspired by the magic of the blank page.</p>
          <div className="flex gap-4">
            <span className="font-semibold text-slate-500">Auto ID Engine</span>
            <span>•</span>
            <span className="font-semibold text-slate-500">Gemini 3.5 AI Driven</span>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authModalInitialTab}
      />

      {/* PROFILE DRAWER (Right Slide-out Drawer) */}
      <AnimatePresence>
        {profileDrawerOpen && currentWriter && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs"
              id="profile-drawer-backdrop"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[#FAF9F5] border-l border-slate-200/80 shadow-2xl p-6 flex flex-col justify-between"
              id="profile-drawer-panel"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/55">
                  <div className="flex items-center gap-2">
                    <Award className="text-amber-500" size={18} />
                    <span className="text-sm font-bold font-display text-slate-950 uppercase tracking-wide">Writer Profile</span>
                  </div>
                  <button
                    onClick={() => setProfileDrawerOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Big Initials circle */}
                <div className="flex flex-col items-center text-center my-6">
                  <div className="w-16 h-16 bg-slate-950 text-amber-300 rounded-full flex items-center justify-center text-2xl font-black shadow-md border border-slate-800">
                    {currentWriter.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="text-lg font-bold font-display text-slate-900 mt-3">{currentWriter.name}</h4>
                  <span className="font-mono text-xs font-bold text-amber-600 tracking-wider mt-0.5">{currentWriter.writerId}</span>
                </div>

                {/* Detailed Information list */}
                <div className="space-y-4 text-xs text-slate-600">
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase text-slate-400">Writer Email</span>
                      <span className="font-medium text-slate-800">{currentWriter.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase text-slate-400">Writer Number</span>
                      <span className="font-medium text-slate-800">{currentWriter.writerNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase text-slate-400">Date of Birth</span>
                      <span className="font-medium text-slate-800">{currentWriter.dob}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
                    <Feather size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase text-slate-400">Favorite Genre</span>
                      <span className="font-medium text-slate-800">{currentWriter.favoriteGenre}</span>
                    </div>
                  </div>

                  {currentWriter.bio && (
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <span className="block text-[9px] uppercase text-slate-400 mb-1">Writer Biography</span>
                      <p className="font-serif italic text-slate-700 leading-relaxed">"{currentWriter.bio}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer bottom logout */}
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-rose-100"
                id="drawer-logout-btn"
              >
                <LogOut size={14} />
                <span>Log Out of Ledger</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
