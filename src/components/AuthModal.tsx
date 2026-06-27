import React, { useState } from "react";
import { X, Feather, Sparkles, User, Mail, Calendar, Phone, Key, ArrowRight, Chrome } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Writer } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (writer: Writer) => void;
  initialTab?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialTab = "signin" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newWriterId, setNewWriterId] = useState<string | null>(null);
  const [registeredWriter, setRegisteredWriter] = useState<Writer | null>(null);

  // Google Login flow states
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [isAddingCustomGoogleAccount, setIsAddingCustomGoogleAccount] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [signUpName, setSignUpName] = useState("");
  const [signUpNumber, setSignUpNumber] = useState("");
  const [signUpDob, setSignUpDob] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpFavoriteGenre, setSignUpFavoriteGenre] = useState("Sci-Fi");
  const [signUpBio, setSignUpBio] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      onAuthSuccess(data.writer);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpName,
          writerNumber: signUpNumber,
          dob: signUpDob,
          email: signUpEmail,
          favoriteGenre: signUpFavoriteGenre,
          bio: signUpBio,
          password: signUpPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setNewWriterId(data.writer.writerId);
      setRegisteredWriter(data.writer);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Action
  const handleGoogleAuth = async (googleEmail: string, googleName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: googleEmail, name: googleName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Google Authentication failed");
      }

      onAuthSuccess(data.writer);
      onClose();
      // Reset Google flow states
      setIsGoogleLogin(false);
      setIsAddingCustomGoogleAccount(false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during Google Sign-In.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = () => {
    if (registeredWriter) {
      onAuthSuccess(registeredWriter);
    }
    onClose();
    // Reset states
    setNewWriterId(null);
    setRegisteredWriter(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auth-modal-overlay">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0a0f1d]/95 shadow-2xl border border-slate-800/80 p-1 flex flex-col max-h-[90vh] z-10 backdrop-blur-md"
        id="auth-modal-container"
      >
        {/* Decorative gold/bronze header strip for literary style */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 w-full" />

        <div className="p-6 overflow-y-auto flex-1">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            id="close-auth-modal"
          >
            <X size={20} />
          </button>

          <AnimatePresence mode="wait">
            {newWriterId ? (
              // Newly Registered Success Screen with generated Writer ID card
              <motion.div
                key="success-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-6 px-2"
                id="writer-id-generation-card"
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
                  <Feather size={30} className="animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">Welcome to the Guild!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your official Writer Credentials have been successfully cataloged.</p>

                {/* The Stylized Writer ID Badge */}
                <div className="my-8 mx-auto max-w-xs p-6 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-rose-500/5 dark:from-amber-500/10 dark:to-rose-500/10 relative overflow-hidden shadow-inner text-left">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 tracking-wider uppercase font-bold">STORY SEEDS GUILD</span>
                      <h4 className="text-lg font-semibold font-display text-slate-800 dark:text-slate-100 leading-tight">{signUpName}</h4>
                    </div>
                    <Feather className="text-amber-500" size={24} />
                  </div>
                  
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 tracking-wider">Writer License ID</span>
                      <span className="font-mono text-lg font-bold text-slate-900 dark:text-amber-300 tracking-widest">{newWriterId}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div>
                        <span className="block text-[9px] uppercase text-slate-400">Genre Preference</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{signUpFavoriteGenre}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-400">Writer Code</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">#{signUpNumber.slice(-4) || "0000"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCompleteRegistration}
                  className="w-full py-3 px-6 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 font-medium transition-all shadow-md flex items-center justify-center gap-2"
                  id="complete-signup-btn"
                >
                  Enter Writing Sanctuary <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : isGoogleLogin ? (
              // Google Identity Account Chooser Screen
              <motion.div
                key="google-chooser-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-4 px-2 text-center"
              >
                {/* Simulated Google Colored Branding */}
                <div className="flex justify-center gap-1 mb-3 text-2xl font-bold tracking-tight">
                  <span className="text-blue-500 font-sans">G</span>
                  <span className="text-red-500 font-sans">o</span>
                  <span className="text-yellow-500 font-sans">o</span>
                  <span className="text-blue-500 font-sans">g</span>
                  <span className="text-green-500 font-sans">l</span>
                  <span className="text-red-500 font-sans">e</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sign in with Google</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">to continue to Story Seeds Guild</p>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs text-center">
                    {error}
                  </div>
                )}

                {isAddingCustomGoogleAccount ? (
                  // Custom Google input form
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGoogleAuth(customGoogleEmail, customGoogleName);
                    }} 
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Google Email Address</label>
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="e.g. wordsmith@gmail.com"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Your Pen Name / Display Name</label>
                      <input
                        type="text"
                        required
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder="e.g. Arthur Conan Doyle"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                      />
                    </div>
                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomGoogleAccount(false)}
                        className="flex-1 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loading ? "Authenticating..." : "Continue"}
                      </button>
                    </div>
                  </form>
                ) : (
                  // Google Preloaded Selector List
                  <div className="space-y-3">
                    {/* Pre-populated Google Account of the real active user */}
                    <button
                      onClick={() => handleGoogleAuth("vinodjvpriya@gmail.com", "Vinod Priya")}
                      disabled={loading}
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/50 hover:bg-blue-50/[0.04] flex items-center gap-3 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold font-display flex items-center justify-center text-sm shadow-md">
                        VP
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Vinod Priya</span>
                        <span className="block text-xs text-slate-400 dark:text-slate-500 font-mono truncate">vinodjvpriya@gmail.com</span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-blue-500 transition-all mr-1" />
                    </button>

                    {/* Choose alternative google account */}
                    <button
                      onClick={() => {
                        setCustomGoogleEmail("");
                        setCustomGoogleName("");
                        setIsAddingCustomGoogleAccount(true);
                      }}
                      className="w-full p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50/[0.04] flex items-center justify-center gap-2 transition-all text-sm text-slate-500 dark:text-slate-400 font-medium cursor-pointer"
                    >
                      <User size={16} />
                      <span>Use another Google account</span>
                    </button>

                    {/* Cancel & return back */}
                    <button
                      onClick={() => { setIsGoogleLogin(false); setError(null); }}
                      className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 transition-colors cursor-pointer"
                    >
                      Back to standard login credentials
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              // Form Content (Sign In or Register)
              <motion.div
                key="auth-forms"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Tab Switcher */}
                <div className="flex bg-slate-950/80 p-1 rounded-xl mb-6 border border-slate-800/60">
                  <button
                    onClick={() => { setActiveTab("signin"); setError(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                      activeTab === "signin"
                        ? "bg-[#0a0f1d] text-amber-400 border border-amber-500/30 shadow-md font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setActiveTab("signup"); setError(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                      activeTab === "signup"
                        ? "bg-[#0a0f1d] text-amber-400 border border-amber-500/30 shadow-md font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Become a Writer
                  </button>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                    {activeTab === "signin" ? "Welcome Back, Wordsmith" : "Enroll as a Guild Writer"}
                    <Sparkles size={18} className="text-amber-500" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activeTab === "signin" 
                      ? "Access your personal catalog and favorite story seeds." 
                      : "Create your writer profile, get an auto-generated ID, and start plotting."}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs text-center" id="auth-error-msg">
                    {error}
                  </div>
                )}

                {activeTab === "signin" ? (
                  // Sign In Form
                  <form onSubmit={handleSignIn} className="space-y-4" id="signin-form">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-amber-400" size={16} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="writer@storyseeds.com"
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 text-amber-400" size={16} />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer animate-pulse-slow"
                      id="signin-submit-btn"
                    >
                      {loading ? "Decrypting Ledger..." : "Open My Quill"}
                    </button>
                  </form>
                ) : (
                  // Sign Up Form (Writer Name, Writer Number, DOB, etc.)
                  <form onSubmit={handleSignUp} className="space-y-4 max-h-[42vh] overflow-y-auto pr-1" id="signup-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Writer Name (Pen Name)</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-amber-400" size={16} />
                          <input
                            type="text"
                            required
                            value={signUpName}
                            onChange={(e) => setSignUpName(e.target.value)}
                            placeholder="e.g. Mary Shelley"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Writer Contact Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 text-amber-400" size={16} />
                          <input
                            type="tel"
                            required
                            value={signUpNumber}
                            onChange={(e) => setSignUpNumber(e.target.value)}
                            placeholder="e.g. +1 (555) 019-2831"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Date of Birth (DOB)</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 text-amber-400" size={16} />
                          <input
                            type="date"
                            required
                            value={signUpDob}
                            onChange={(e) => setSignUpDob(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 text-amber-400" size={16} />
                          <input
                            type="email"
                            required
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            placeholder="writer@storyseeds.com"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Favorite Genre</label>
                        <select
                          value={signUpFavoriteGenre}
                          onChange={(e) => setSignUpFavoriteGenre(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                        >
                          <option value="Sci-Fi">Sci-Fi (Science Fiction)</option>
                          <option value="Fantasy">Fantasy</option>
                          <option value="Mystery & Thriller">Mystery & Thriller</option>
                          <option value="Horror">Horror</option>
                          <option value="Romance & Drama">Romance & Drama</option>
                          <option value="Historical Fiction">Historical Fiction</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Biography / About You</label>
                        <textarea
                          value={signUpBio}
                          onChange={(e) => setSignUpBio(e.target.value)}
                          placeholder="A brief mention of what drives your imagination..."
                          rows={2}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium resize-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Secret Key (Password)</label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 text-amber-400" size={16} />
                          <input
                            type="password"
                            required
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-medium transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      id="signup-submit-btn"
                    >
                      {loading ? "Engraving Ledger..." : "Register & Auto-Generate ID"}
                    </button>
                  </form>
                )}

                {/* OR divider for Google Sign-In */}
                <div className="relative my-5 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative px-3 bg-[#0a0f1d] text-[10px] uppercase font-mono tracking-wider text-slate-400">or continue with</span>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={() => { setIsGoogleLogin(true); setError(null); }}
                  className="w-full py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300"
                  id="google-signin-btn"
                >
                  {/* Colorful Google G SVG Icon */}
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
