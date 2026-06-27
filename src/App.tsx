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
  Award,
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  HeartHandshake,
  Film,
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Writer, StorySeed, GENRES_WITH_SETTINGS, AppTheme, THEMES } from "./types";
import AuthModal from "./components/AuthModal";
import SeedGenerator from "./components/SeedGenerator";
import SeedCard from "./components/SeedCard";
import BackgroundMovie from "./components/BackgroundMovie";
// @ts-ignore
import creativeThoughtsBg from "./assets/images/creative_thoughts_bg_1782539766429.jpg";

export default function App() {
  const [currentWriter, setCurrentWriter] = useState<Writer | null>(null);
  const [seeds, setSeeds] = useState<StorySeed[]>([]);
  const [activeTab, setActiveTab] = useState<"community" | "my-seeds" | "writers-guild">("community");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Friends & Local persistence states
  const [locallyCreatedSeedIds, setLocallyCreatedSeedIds] = useState<string[]>([]);
  const [allWriters, setAllWriters] = useState<Writer[]>([]);
  const [onlyShowFriendsSeeds, setOnlyShowFriendsSeeds] = useState<boolean>(false);

  // Deep linked seed state
  const [sharedSeedId, setSharedSeedId] = useState<string | null>(null);

  const handleClearSharedSeed = () => {
    setSharedSeedId(null);
    const newUrl = window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  };

  // UI Modals / Drawer toggles
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<"signin" | "signup">("signin");
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Success alert toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active theme state
  const [activeThemeId, setActiveThemeId] = useState<string>("sunset");
  const activeTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

  const generatorSectionRef = useRef<HTMLDivElement>(null);

  // Load writer session, local seeds and community details on boot
  useEffect(() => {
    // 0. Theme load
    const savedTheme = localStorage.getItem("story_seeds_theme");
    if (savedTheme) {
      setActiveThemeId(savedTheme);
    }

    // 1. Session load
    const saved = localStorage.getItem("story_seeds_writer");
    if (saved) {
      try {
        setCurrentWriter(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved writer", e);
      }
    }

    // 2. Load locally created seed IDs
    const savedLocals = localStorage.getItem("story_seeds_local_created_ids");
    if (savedLocals) {
      try {
        setLocallyCreatedSeedIds(JSON.parse(savedLocals));
      } catch (e) {
        console.error("Failed to parse locally created seed IDs", e);
      }
    }

    // 3. Fetch all story seeds and writers
    fetchSeeds();
    fetchAllWriters();

    // 4. Parse deep link parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get("seed");
    if (sharedId) {
      setSharedSeedId(sharedId);
      showToast("Tuned sanctuary filters to deep-linked seed! ✨");
    }
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

  const fetchAllWriters = async () => {
    try {
      const response = await fetch("/api/writers");
      if (response.ok) {
        const data = await response.json();
        setAllWriters(data);
      }
    } catch (err) {
      console.error("Failed to fetch registered writers:", err);
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
    fetchAllWriters(); // refresh friends info
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

  const handleFireToggle = async (seedId: string) => {
    if (!currentWriter) {
      setAuthModalInitialTab("signin");
      setAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/seeds/${seedId}/fire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerId: currentWriter.writerId })
      });

      if (response.ok) {
        const updatedSeed = await response.json();
        setSeeds(prev => prev.map(s => s.id === seedId ? updatedSeed : s));
        showToast("Added your creative energy to this seed! 🔥");
      }
    } catch (err) {
      console.error("Error toggling fire reaction:", err);
    }
  };

  const handleDeleteSeed = async (seedId: string) => {
    const isLocalCreator = locallyCreatedSeedIds.includes(seedId);
    const isLoggedCreator = currentWriter && seeds.find(s => s.id === seedId)?.creatorWriterId === currentWriter.writerId;

    if (!isLocalCreator && !isLoggedCreator) {
      showToast("You are not authorized to delete this seed.");
      return;
    }

    try {
      const response = await fetch(`/api/seeds/${seedId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerId: currentWriter ? currentWriter.writerId : null })
      });

      if (response.ok) {
        setSeeds(prev => prev.filter(s => s.id !== seedId));
        // Remove from locally created list if present
        const updatedLocals = locallyCreatedSeedIds.filter(id => id !== seedId);
        setLocallyCreatedSeedIds(updatedLocals);
        localStorage.setItem("story_seeds_local_created_ids", JSON.stringify(updatedLocals));
        showToast("Story seed banished from the sanctuary.");
      }
    } catch (err) {
      console.error("Error deleting seed:", err);
    }
  };

  const handleToggleFriend = async (friendId: string) => {
    if (!currentWriter) {
      showToast("Please sign in to add writers to your Guild Network.");
      handleOpenAuthTab("signin");
      return;
    }

    if (friendId === currentWriter.writerId) {
      showToast("You cannot add yourself as a friend!");
      return;
    }

    try {
      const response = await fetch(`/api/writers/${currentWriter.writerId}/friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId })
      });

      if (response.ok) {
        const updatedWriter = await response.json();
        setCurrentWriter(updatedWriter);
        localStorage.setItem("story_seeds_writer", JSON.stringify(updatedWriter));
        
        const isNowFriend = updatedWriter.friends?.includes(friendId);
        const friendName = allWriters.find(w => w.writerId === friendId)?.name || "Writer";
        if (isNowFriend) {
          showToast(`Joined paths with ${friendName}! 🤝`);
        } else {
          showToast(`Departed paths with ${friendName}.`);
        }
        fetchAllWriters(); // refresh list
      }
    } catch (err) {
      console.error("Error toggling friend connection:", err);
    }
  };

  const handleNewSeedGenerated = (newSeed: StorySeed) => {
    setSeeds(prev => [newSeed, ...prev]);
    
    // Save locally created seed ID to preserve even anonymously
    const updatedLocals = [...locallyCreatedSeedIds, newSeed.id];
    setLocallyCreatedSeedIds(updatedLocals);
    localStorage.setItem("story_seeds_local_created_ids", JSON.stringify(updatedLocals));
    
    showToast("A new Story Seed has been sown in your conservatory!");
    
    // Auto switch to My Seeds so they see it right away!
    setActiveTab("my-seeds");

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
    // If a shared seed ID is active, bypass regular gallery filters to display the targeted seed
    if (sharedSeedId) {
      return seed.id === sharedSeedId;
    }

    // 1. Tab filtering
    if (activeTab === "my-seeds") {
      const isLocalOwner = locallyCreatedSeedIds.includes(seed.id);
      const isLoggedOwner = currentWriter && seed.creatorWriterId === currentWriter.writerId;
      if (!isLocalOwner && !isLoggedOwner) {
        return false;
      }
    }

    // 2. Only show friends' seeds filter
    if (onlyShowFriendsSeeds && currentWriter) {
      const friends = currentWriter.friends || [];
      if (!seed.creatorWriterId || !friends.includes(seed.creatorWriterId)) {
        return false;
      }
    }

    // 3. Genre filtering
    if (selectedGenreFilter !== "All" && seed.genre !== selectedGenreFilter) {
      return false;
    }

    // 4. Search query filtering (by text, setting, creator or tone)
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
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans antialiased relative overflow-x-hidden ${activeTheme.selectionClass}`}>
      
      {/* 20-Second Cinematic Animated Film Loop Background */}
      <BackgroundMovie />

      {/* Decorative Warm Backlighting */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${activeTheme.light1} rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20`} />
      <div className={`absolute top-[800px] left-0 w-[400px] h-[400px] ${activeTheme.light2} rounded-full blur-[100px] pointer-events-none -ml-40`} />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-md border-b border-slate-900/60 px-4 sm:px-8 py-4 flex items-center justify-between" id="app-header">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 bg-gradient-to-br ${activeTheme.gradientFrom} ${activeTheme.gradientTo} text-white rounded-xl flex items-center justify-center shadow-md ${activeTheme.glowColor}`}>
            <Feather size={18} />
          </div>
          <span className={`text-xl font-bold tracking-tight font-display bg-gradient-to-r ${activeTheme.gradientText} bg-clip-text text-transparent`}>Story Seeds</span>
        </div>

        {/* Profile & Auth Status Top Right */}
        <div className="flex items-center gap-3">
          {currentWriter ? (
            <button
              onClick={() => setProfileDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer"
              id="header-profile-btn"
            >
              <div className={`w-6 h-6 bg-gradient-to-br ${activeTheme.gradientFrom} ${activeTheme.gradientTo} text-white rounded-full flex items-center justify-center font-bold text-xs`}>
                {currentWriter.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[100px] truncate">
                {currentWriter.name}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileDrawerOpen(true)}
                className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800 cursor-pointer"
                id="header-guest-settings-btn"
                title="Aesthetic Themes & Settings"
              >
                <Palette size={15} className={activeTheme.accentText} />
              </button>
              <button
                onClick={() => handleOpenAuthTab("signin")}
                className="text-xs font-semibold px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                id="header-signin-btn"
              >
                Sign In
              </button>
              <button
                onClick={() => handleOpenAuthTab("signup")}
                className={`text-xs font-bold px-4 py-2 rounded-full ${activeTheme.buttonPrimary} text-white hover:opacity-90 transition-all shadow-md ${activeTheme.glowColor} cursor-pointer`}
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
            <Sparkles size={14} className={activeTheme.accentText} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-12 sm:gap-16">
        
        {/* HERO SECTION / FRONT PAGE INTRO */}
        <section 
          className="relative rounded-3xl overflow-hidden py-12 px-6 sm:py-20 sm:px-12 max-w-4xl mx-auto flex flex-col items-center gap-6 shadow-2xl border border-slate-900/60 text-center bg-[#070b16]/75 backdrop-blur-md" 
          id="hero-intro-section"
        >
          {/* Background image overlay with subtle opacity - drifts continuously */}
          <motion.div 
            className="absolute inset-0 bg-cover bg-center opacity-[0.08] pointer-events-none"
            style={{ backgroundImage: `url(${creativeThoughtsBg})` }}
            animate={{
              scale: [1, 1.08, 1.03, 1.12, 1],
              rotate: [0, 1.5, -1.5, 2, 0],
              x: [0, 8, -8, 4, 0],
              y: [0, -8, 8, -4, 0],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Subtle warm gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] via-rose-500/[0.02] to-transparent pointer-events-none" />

          {/* Glowing artistic badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${activeTheme.badgeClass} font-mono text-[10px] tracking-wider uppercase font-bold`}
          >
            <Sparkles size={12} className="animate-spin-slow" />
            Empowering the Literary Mind
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight leading-none"
          >
            Sow the Seeds of <span className="relative inline-block">
              <span className={`relative z-10 text-transparent bg-clip-text bg-gradient-to-r ${activeTheme.gradientText}`}>Dramatic Tension</span>
              <span className={`absolute left-0 right-0 bottom-1 h-2 ${activeTheme.accentBg} -z-0`} />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 font-serif leading-relaxed max-w-2xl"
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
              className={`px-10 py-5 rounded-full bg-slate-900 text-white font-bold font-display shadow-2xl hover:${activeTheme.glowColor} hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 border border-slate-800 text-base relative overflow-hidden cursor-pointer`}
              id="hero-create-story-btn"
            >
              {/* Highlight flash */}
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
              <Feather size={20} className={activeTheme.accentText} />
              <span>CREATE A STORY SEED</span>
              <ArrowDown size={18} className="animate-bounce" />
            </button>

            {/* Below the button login options as requested */}
            {!currentWriter ? (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>First time?</span>
                <button 
                  onClick={() => handleOpenAuthTab("signup")}
                  className={`font-bold ${activeTheme.accentText} hover:opacity-80 underline cursor-pointer`}
                  id="hero-signup-shortcut"
                >
                  Join the Guild (Sign Up)
                </button>
                <span className="mx-1 text-slate-600">•</span>
                <button 
                  onClick={() => handleOpenAuthTab("signin")}
                  className="font-bold text-slate-200 hover:text-white underline cursor-pointer"
                  id="hero-signin-shortcut"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Authenticated as <strong className={activeTheme.accentText}>{currentWriter.name} ({currentWriter.writerId})</strong>
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
              activeTheme={activeTheme}
            />
          </div>
        </section>

        {/* SEED EXPLORATION GALLERY SECTION */}
        <section className="scroll-mt-24 border-t border-slate-900 pt-12" id="seeds-section">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-bold font-display text-white flex items-center gap-2">
                <BookMarked size={22} className={activeTheme.accentText} />
                The Conservatory
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Explore atmospheric story seeds cataloged by other guild wordsmiths.
              </p>
            </div>

            {/* Tabs (Community / My Seeds / Writers Guild) */}
            <div className="flex p-1 bg-slate-900/80 rounded-xl max-w-fit border border-slate-800/80">
              <button
                onClick={() => setActiveTab("community")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "community"
                    ? `bg-[#0a0f1d] ${activeTheme.accentText} border ${activeTheme.accentBorder} shadow-md`
                    : "text-slate-400 hover:text-slate-100"
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
                    ? `bg-[#0a0f1d] ${activeTheme.accentText} border ${activeTheme.accentBorder} shadow-md`
                    : "text-slate-400 hover:text-slate-100"
                }`}
                id="my-seeds-tab-btn"
              >
                <Feather size={14} />
                <span>My Saved Seeds</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("writers-guild");
                  fetchAllWriters();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "writers-guild"
                    ? `bg-[#0a0f1d] ${activeTheme.accentText} border ${activeTheme.accentBorder} shadow-md`
                    : "text-slate-400 hover:text-slate-100"
                }`}
                id="writers-guild-tab-btn"
              >
                <Users size={14} />
                <span>Writers Guild</span>
              </button>
            </div>
          </div>

          {/* Filtering, Searching UI Panel */}
          <div className="bg-[#0a0f1d]/60 rounded-2xl p-4 border border-slate-800/80 shadow-lg flex flex-col md:flex-row gap-4 items-center mb-8">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className={`absolute left-3 top-3 ${activeTheme.accentText}`} size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "writers-guild"
                    ? "Search writers by name, favorite genre, writer ID..."
                    : "Search seeds by text, setting, tone, creator..."
                }
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
              />
            </div>

            {/* Genre Filter Pills (Only for Seeds tabs) */}
            {activeTab !== "writers-guild" && (
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <span className="text-xs text-slate-400 mr-2 font-semibold">Filter:</span>
                {["All", ...Object.keys(GENRES_WITH_SETTINGS)].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenreFilter(genre)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedGenreFilter === genre
                        ? `${activeTheme.buttonPrimary} text-white font-semibold border-transparent shadow-md`
                        : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    }`}
                    id={`genre-filter-${genre}`}
                  >
                    {genre}
                  </button>
                ))}

                {/* Friends Only Filter Toggle */}
                {currentWriter && (
                  <button
                    onClick={() => setOnlyShowFriendsSeeds(!onlyShowFriendsSeeds)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      onlyShowFriendsSeeds
                        ? `${activeTheme.accentBg} ${activeTheme.accentText} ${activeTheme.accentBorder}`
                        : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800"
                    }`}
                    title="Only show story seeds from writers you have added to your guild"
                    id="friends-only-toggle-btn"
                  >
                    <HeartHandshake size={12} className={onlyShowFriendsSeeds ? activeTheme.accentText : "text-slate-400"} />
                    <span>Friends Only</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content Views based on Active Tab */}
          <AnimatePresence mode="popLayout">
            {activeTab === "writers-guild" ? (
              // ================= WRITERS GUILD VIEW =================
              <div key="writers-guild-view" className="space-y-6">
                <div className="bg-[#0a0f1d]/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl mb-6">
                  <h4 className={`text-sm font-bold uppercase tracking-wider ${activeTheme.accentText} font-display flex items-center gap-2`}>
                    <Users size={16} />
                    <span>Guild Directory</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Connect with fellow wordsmiths in the conservatory. Link paths to construct cohesive story worlds, co-create story seeds, and keep track of your favorite authors.
                  </p>
                </div>

                {/* Writers Profiles Grid */}
                {allWriters.filter(w => {
                  if (searchQuery.trim() !== "") {
                    const q = searchQuery.toLowerCase();
                    return (
                      w.name.toLowerCase().includes(q) ||
                      w.favoriteGenre.toLowerCase().includes(q) ||
                      w.writerId.toLowerCase().includes(q)
                    );
                  }
                  return true;
                }).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="writers-grid">
                    {allWriters
                      .filter(w => {
                        if (searchQuery.trim() !== "") {
                          const q = searchQuery.toLowerCase();
                          return (
                            w.name.toLowerCase().includes(q) ||
                            w.favoriteGenre.toLowerCase().includes(q) ||
                            w.writerId.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((writer) => {
                        const isSelf = currentWriter && writer.writerId === currentWriter.writerId;
                        const isFriend = currentWriter?.friends?.includes(writer.writerId);
                        
                        return (
                          <motion.div
                            key={writer.writerId}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className={`p-5 rounded-2xl border bg-[#0a0f1d]/75 backdrop-blur-md flex flex-col justify-between gap-4 transition-all hover:border-slate-700/80 ${
                              isSelf ? `${activeTheme.accentBorder} ring-1 ${activeTheme.accentBg}` : "border-slate-800/80"
                            }`}
                            id={`writer-card-${writer.writerId}`}
                          >
                            <div className="space-y-3">
                              {/* Header info */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {writer.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <span>{writer.name}</span>
                                      {isSelf && (
                                        <span className={`text-[9px] uppercase ${activeTheme.badgeClass} px-1.5 py-0.5 rounded font-mono font-bold`}>You</span>
                                      )}
                                    </h5>
                                    <span className="text-[10px] font-mono text-slate-500">{writer.writerId}</span>
                                  </div>
                                </div>

                                {/* Genre Badge */}
                                <span className={`text-[10px] uppercase font-bold bg-slate-900 px-2 py-1 rounded-lg ${activeTheme.accentText} border border-slate-800`}>
                                  {writer.favoriteGenre}
                                </span>
                              </div>

                              {/* Biography */}
                              <p className="text-xs text-slate-300 font-serif italic line-clamp-3 leading-relaxed">
                                {writer.bio ? `"${writer.bio}"` : '"Whispering stories in the dark conservatory..."'}
                              </p>

                              {/* Date Info */}
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <span>Member Since:</span>
                                <span className="font-medium text-slate-400">
                                  {new Date(writer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                              {/* Toggle Connection Button (No show for self) */}
                              {!isSelf ? (
                                <button
                                  onClick={() => handleToggleFriend(writer.writerId)}
                                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    isFriend
                                      ? "bg-rose-950/20 text-rose-400 border border-rose-900/40 hover:bg-rose-900/30"
                                      : "bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800"
                                  }`}
                                  id={`writer-friend-btn-${writer.writerId}`}
                                >
                                  {isFriend ? (
                                    <>
                                      <UserCheck size={12} />
                                      <span>Linked Path</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus size={12} />
                                      <span>Link Path</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <div className={`flex-1 text-center py-2 text-[10px] font-mono ${activeTheme.accentText} opacity-70 uppercase font-bold`}>
                                  Archivist Profile
                                </div>
                              )}

                              {/* View Seeds Button */}
                              <button
                                onClick={() => {
                                  setActiveTab("community");
                                  setSearchQuery(writer.name);
                                }}
                                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title={`Filter seeds created by ${writer.name}`}
                              >
                                <Compass size={13} />
                              </button>

                              {/* Send Creative Spark Mock Action (Interactive toast) */}
                              {!isSelf && (
                                <button
                                  onClick={() => {
                                    const sparkTypes = [
                                      "✨ glowing spark of suspense",
                                      "⚡ bolts of rapid-fire conflict",
                                      "🕯️ mystical candle of fantasy setting",
                                      "❤️ supportive wave of inspiration",
                                      "☕ hot cup of creative caffeine"
                                    ];
                                    const randomSpark = sparkTypes[Math.floor(Math.random() * sparkTypes.length)];
                                    showToast(`Sent a ${randomSpark} to Writer ${writer.name}! 🚀`);
                                  }}
                                  className={`p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:${activeTheme.accentText} hover:bg-slate-800 transition-colors cursor-pointer`}
                                  title={`Send creative spark to ${writer.name}`}
                                >
                                  <MessageSquare size={13} />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 px-4 bg-[#0a0f1d]/60 rounded-2xl border border-slate-800/80 shadow-sm max-w-md mx-auto"
                  >
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 mb-4">
                      <Users size={24} />
                    </div>
                    <h4 className="text-base font-bold text-white">No Writers Located</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      No wordsmiths match your directory search criteria. Try matching by full name or genre instead!
                    </p>
                  </motion.div>
                )}
              </div>
            ) : (
              // ================= SEEDS GALLERIES VIEW =================
              <div key="seeds-gallery-view">
                {sharedSeedId && (
                  <div className="mb-6 p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-orange-400">
                      <Sparkles size={16} />
                      <span className="text-xs font-semibold">Viewing a deep-linked Story Seed shared with you!</span>
                    </div>
                    <button
                      onClick={handleClearSharedSeed}
                      className="px-3 py-1 bg-orange-900 hover:bg-orange-800 text-orange-100 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      View All Seeds
                    </button>
                  </div>
                )}

                {filteredSeeds.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="seeds-grid">
                    {filteredSeeds.map((seed) => (
                      <SeedCard
                        key={seed.id}
                        seed={seed}
                        currentWriter={currentWriter}
                        locallyCreatedSeedIds={locallyCreatedSeedIds}
                        onLikeToggle={handleLikeToggle}
                        onFireToggle={handleFireToggle}
                        onDelete={handleDeleteSeed}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 px-4 bg-[#0a0f1d]/60 rounded-2xl border border-slate-800/80 shadow-sm max-w-md mx-auto"
                    id="no-seeds-view"
                  >
                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400 mb-4">
                      <Info size={24} />
                    </div>
                    <h4 className="text-base font-bold text-white">No Story Seeds Cataloged</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      {searchQuery 
                        ? "We couldn't find any seeds matching your active search query." 
                        : "Be the first to generate a seed with those specific parameters and enrich the archive!"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedGenreFilter("All"); setOnlyShowFriendsSeeds(false); }}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950 px-4 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Story Seeds Guild. Inspired by the magic of the blank page.</p>
          <div className="flex gap-4">
            <span className="font-semibold text-slate-600">Auto ID Engine</span>
            <span>•</span>
            <span className="font-semibold text-slate-600">Gemini 3.5 AI Driven</span>
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
        {profileDrawerOpen && (
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
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[#0a0f1d] border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
              id="profile-drawer-panel"
            >
              <div className="flex-1 overflow-y-auto pr-1 -mr-1">
                {/* Header info */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Award className={activeTheme.accentText} size={18} />
                    <span className="text-sm font-bold font-display text-white uppercase tracking-wide">
                      {currentWriter ? "Writer Profile" : "Guest Sanctuary"}
                    </span>
                  </div>
                  <button
                    onClick={() => setProfileDrawerOpen(false)}
                    className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {currentWriter ? (
                  <>
                    {/* Big Initials circle */}
                    <div className="flex flex-col items-center text-center my-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${activeTheme.gradientFrom} ${activeTheme.gradientTo} text-white rounded-full flex items-center justify-center text-2xl font-black shadow-md`}>
                        {currentWriter.name.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="text-lg font-bold font-display text-white mt-3">{currentWriter.name}</h4>
                      <span className={`font-mono text-xs font-bold ${activeTheme.accentText} tracking-wider mt-0.5`}>{currentWriter.writerId}</span>
                    </div>

                    {/* Detailed Information list */}
                    <div className="space-y-4 text-xs text-slate-300">
                      <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <span className="block text-[9px] uppercase text-slate-500">Writer Email</span>
                          <span className="font-medium text-slate-100">{currentWriter.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <span className="block text-[9px] uppercase text-slate-500">Writer Number</span>
                          <span className="font-medium text-slate-100">{currentWriter.writerNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <span className="block text-[9px] uppercase text-slate-500">Date of Birth</span>
                          <span className="font-medium text-slate-100">{currentWriter.dob}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <Feather size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <span className="block text-[9px] uppercase text-slate-500">Favorite Genre</span>
                          <span className="font-medium text-slate-100">{currentWriter.favoriteGenre}</span>
                        </div>
                      </div>

                      {currentWriter.bio && (
                        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                          <span className="block text-[9px] uppercase text-slate-500 mb-1">Writer Biography</span>
                          <p className="font-serif italic text-slate-200 leading-relaxed">"{currentWriter.bio}"</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center my-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                    <div className="w-16 h-16 bg-slate-800 border border-slate-700/30 text-slate-400 rounded-full flex items-center justify-center text-2xl font-black shadow-inner">
                      G
                    </div>
                    <h4 className="text-base font-bold font-display text-white mt-3">Guest Wordsmith</h4>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Anonymous Mode</span>
                    <p className="text-xs text-slate-400 mt-3 max-w-[240px] leading-relaxed">
                      You are generating story seeds anonymously. Sign up or log in to customize your profile, build a directory listing, and track likes!
                    </p>
                    <button
                      onClick={() => {
                        setProfileDrawerOpen(false);
                        handleOpenAuthTab("signup");
                      }}
                      className={`mt-4 px-5 py-2.5 rounded-full text-xs font-bold text-white ${activeTheme.buttonPrimary} shadow-lg transition-all hover:scale-105 active:scale-95`}
                    >
                      Join the Guild
                    </button>
                  </div>
                )}

                {/* THEME SELECTOR SECTION */}
                <div className="mt-8 border-t border-slate-800/80 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className={activeTheme.accentText} size={16} />
                    <h5 className="text-xs font-bold uppercase text-white tracking-wider">Sanctuary Theme</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {THEMES.map((t) => {
                      const isSelected = t.id === activeThemeId;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveThemeId(t.id);
                            localStorage.setItem("story_seeds_theme", t.id);
                            showToast(`Aesthetic switched to ${t.name}! ✨`);
                          }}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? `bg-slate-900 ${t.accentBorder} ${t.accentText} shadow-md font-semibold`
                              : "bg-slate-950/40 text-slate-400 border-slate-800/60 hover:bg-slate-900/40 hover:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${t.gradientFrom} ${t.gradientTo}`} />
                            <div>
                              <span className="text-xs block font-medium">{t.name}</span>
                              <span className="text-[10px] block text-slate-500 font-mono">{t.colorName}</span>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className={t.accentText} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer bottom actions */}
              <div className="mt-8 pt-4 border-t border-slate-800/80">
                {currentWriter ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-rose-900/40"
                    id="drawer-logout-btn"
                  >
                    <LogOut size={14} />
                    <span>Log Out of Ledger</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setProfileDrawerOpen(false);
                        handleOpenAuthTab("signin");
                      }}
                      className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
                      id="drawer-signin-btn"
                    >
                      <User size={13} />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDrawerOpen(false);
                        handleOpenAuthTab("signup");
                      }}
                      className={`flex-1 py-3 ${activeTheme.buttonPrimary} text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer`}
                      id="drawer-signup-btn"
                    >
                      <span>Register</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
