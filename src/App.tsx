/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  TrendingUp, 
  ChevronRight, 
  BarChart3, 
  ExternalLink,
  Menu,
  X,
  Clock,
  Calendar,
  Share2,
  Sparkles,
  Zap,
  Moon,
  LogOut,
  Eye,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Lock,
  Mail,
  User as UserIcon,
  Search,
  BookOpen
} from "lucide-react";
import { REPORTS, Report, PAGES_CONTENT } from "./constants";
import { 
  signUp, 
  signIn, 
  signOut, 
  recoverPassword,
  fetchEntries, 
  saveEntry, 
  deleteEntry, 
  subscribeToAuth, 
  isFirebaseActive,
  setForceLocal,
  getFirebaseActive
} from "./firebaseConnection";
import { UserSession, CryptoDiaryEntry } from "./types";
import { 
  analyzeHillEstimator, 
  SANDBOX_DATASETS, 
  getTailRiskLabel, 
  getAbsoluteLogReturns 
} from "./mathUtils";

type Theme = "nordic" | "nordic-dark" | "stockholm";
type View = "reports" | "methodology" | "contact" | "indicator_theory" | "risk_assessment" | "api" | "desktop" | "enterprise" | "diary" | "terms";

export default function App() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeView, setActiveView] = useState<View>("reports");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("stockholm");

  // User auth state
  const [user, setUser] = useState<UserSession | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authNickname, setAuthNickname] = useState("");
  const [isUsingFirebase, setIsUsingFirebase] = useState(getFirebaseActive());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const handleToggleForceLocal = (forceLocalValue: boolean) => {
    setForceLocal(forceLocalValue);
    setIsUsingFirebase(getFirebaseActive());
    setAuthError(null);
    setAuthSuccess(null);
  };

  // Diary state
  const [diaryEntries, setDiaryEntries] = useState<CryptoDiaryEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [diarySearch, setDiarySearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<CryptoDiaryEntry | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Diary Form state (Initializing fields)
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    cryptoName: "",
    closePrice: "",
    ema50: "",
    ema200: "",
    sma50: "",
    sma200: "",
    macd: "",
    rsi: "",
    hillEstimator: ""
  };
  const [diaryForm, setDiaryForm] = useState(initialFormState);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "nordic" ? "" : theme);
  }, [theme]);

  // Hook into Auth status changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((session) => {
      setUser(session);
      if (session) {
        loadUserEntries(session.uid);
      } else {
        setDiaryEntries([]);
      }
    });
    return unsubscribe;
  }, []);

  const loadUserEntries = async (uid: string) => {
    setIsLoadingEntries(true);
    try {
      const records = await fetchEntries(uid);
      setDiaryEntries(records);
    } catch (err) {
      console.error("Failed to load entries from db:", err);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleNavigate = (view: View) => {
    setActiveView(view);
    setSelectedReport(null);
    setIsMenuOpen(false);
    // Reset local notices
    setAuthError(null);
    setAuthSuccess(null);
    setSaveSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentContent = useMemo(() => {
    if (activeView === "reports" || activeView === "diary") return null;
    return (PAGES_CONTENT as any)[activeView];
  }, [activeView]);

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    if (!authEmail || !authPassword) {
      setAuthError("Please provide both email and password.");
      setAuthLoading(false);
      return;
    }

    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      setAuthLoading(false);
      return;
    }

    try {
      if (authMode === "register") {
        await signUp(authEmail, authPassword, authNickname);
        setAuthSuccess(`Account registered successfully as "${authNickname || authEmail.split('@')[0]}"! Welcome to your technical diary.`);
        setAuthEmail("");
        setAuthPassword("");
        setAuthNickname("");
      } else {
        await signIn(authEmail, authPassword);
        setAuthSuccess("Successfully logged in.");
        setAuthEmail("");
        setAuthPassword("");
      }
    } catch (err: any) {
      setAuthError(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setDiaryEntries([]);
      setSaveSuccess(false);
    } catch (err) {
      console.error("Signout failed:", err);
    }
  };

  // Handle Password Recovery / Reset Trigger
  const handleRecoverPassword = async () => {
    if (!authEmail) {
      setAuthError("Input your email address first so we can find your account or dispatch a reset link.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const msg = await recoverPassword(authEmail);
      setAuthSuccess(msg);
    } catch (err: any) {
      setAuthError(err.message || "Failed to trigger recovery process.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Save Diary entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    if (!user) return;

    if (!diaryForm.cryptoName.trim()) {
      alert("Please provide the cryptocurrency symbol or name.");
      return;
    }
    if (!diaryForm.closePrice.trim()) {
      alert("Please enter the closing price.");
      return;
    }

    setSaveLoading(true);
    try {
      await saveEntry(user.uid, {
        cryptoName: diaryForm.cryptoName.trim().toUpperCase(),
        closePrice: diaryForm.closePrice,
        date: diaryForm.date,
        ema50: diaryForm.ema50,
        ema200: diaryForm.ema200,
        sma50: diaryForm.sma50,
        sma200: diaryForm.sma200,
        macd: diaryForm.macd,
        rsi: diaryForm.rsi,
        hillEstimator: diaryForm.hillEstimator
      });

      setSaveSuccess(true);
      // Reset form variables while keeping the date
      setDiaryForm(prev => ({
        ...initialFormState,
        date: prev.date
      }));
      // Reload current items
      await loadUserEntries(user.uid);
    } catch (error: any) {
      alert("Failed to store Technical analysis data. Check network status.");
    } finally {
      setSaveLoading(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    
    // UI-level double confirm safe for iFrames
    if (deletingId !== entryId) {
      setDeletingId(entryId);
      setTimeout(() => {
        setDeletingId(current => current === entryId ? null : current);
      }, 4000);
      return;
    }

    try {
      await deleteEntry(user.uid, entryId);
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
      setDeletingId(null);
      await loadUserEntries(user.uid);
    } catch (err) {
      console.error("Could not remove entry:", err);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!diarySearch.trim()) return diaryEntries;
    const term = diarySearch.toLowerCase();
    return diaryEntries.filter(entry => 
      entry.cryptoName.toLowerCase().includes(term) ||
      entry.date.includes(term)
    );
  }, [diaryEntries, diarySearch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.6 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const themes: { id: Theme; icon: any; label: string }[] = [
    { id: "nordic", icon: Zap, label: "Nordic Light" },
    { id: "nordic-dark", icon: Moon, label: "Nordic Dark" },
    { id: "stockholm", icon: Sparkles, label: "Stockholm Rose" },
  ];

  return (
    <div className="min-h-screen selection:bg-accent selection:text-text-inv font-sans bg-bg text-text-main transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-base bg-bg/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => handleNavigate("reports")}
          >
            <div className="w-12 h-12 bg-accent rounded flex items-center justify-center">
              <BarChart3 className="text-text-inv w-6 h-6" />
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-lg font-bold tracking-tight leading-none">FINANCIAL</span>
              <span className="text-lg font-light tracking-widest leading-none text-accent">MODELLING</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            <div className="flex items-center gap-8 text-sm font-medium">
              <button 
                className={`transition-colors h-24 border-b-2 flex items-center ${activeView === "reports" ? "border-accent text-text-main" : "border-transparent text-text-dim hover:text-text-main"}`}
                onClick={() => handleNavigate("reports")}
              >
                Reports
              </button>
              <button 
                className={`transition-colors h-24 border-b-2 flex items-center ${activeView === "methodology" ? "border-accent text-text-main" : "border-transparent text-text-dim hover:text-text-main"}`}
                onClick={() => handleNavigate("methodology")}
              >
                Methodology
              </button>
              <button 
                className={`transition-colors h-24 border-b-2 flex items-center ${activeView === "contact" ? "border-accent text-text-main" : "border-transparent text-text-dim hover:text-text-main"}`}
                onClick={() => handleNavigate("contact")}
              >
                Contact
              </button>
              <button 
                className={`transition-colors h-24 border-b-2 flex items-center gap-2 ${activeView === "diary" ? "border-accent text-text-main" : "border-transparent text-text-dim hover:text-text-main"}`}
                onClick={() => handleNavigate("diary")}
              >
                <BookOpen className="w-4 h-4 text-accent" />
                Crypto Daybook
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-surface p-1 rounded border border-base">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 text-xs font-medium ${
                      theme === t.id 
                      ? "bg-accent text-text-inv" 
                      : "text-text-dim hover:text-text-main"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {theme === t.id && <span>{t.label}</span>}
                  </button>
                ))}
              </div>
              <a 
                href="https://beta-version-test-app-ktki.vercel.app/" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-text-main text-bg px-6 py-3 rounded text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                Launch Terminal
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-bg border-b border-base overflow-hidden"
            >
              <div className="flex flex-col p-8 gap-8 font-bold uppercase text-xs tracking-widest">
                <button 
                  onClick={() => handleNavigate("reports")}
                  className={activeView === "reports" ? "text-accent" : "text-text-dim"}
                >
                  Reports
                </button>
                <button 
                  onClick={() => handleNavigate("methodology")}
                  className={activeView === "methodology" ? "text-accent" : "text-text-dim"}
                >
                  Methodology
                </button>
                <button 
                  onClick={() => handleNavigate("contact")}
                  className={activeView === "contact" ? "text-accent" : "text-text-dim"}
                >
                  Contact
                </button>
                <button 
                  onClick={() => handleNavigate("diary")}
                  className={activeView === "diary" ? "text-accent" : "text-text-dim"}
                >
                  Crypto Diary
                </button>
                <hr className="border-base" />
                <div className="flex flex-wrap gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`px-4 py-2 rounded border border-base ${theme === t.id ? "bg-accent text-text-inv border-accent" : "text-text-dim"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-48 pb-32 px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeView === "diary" ? (
            <motion.div
              key="diary-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header Status Bar (transparent, high-end) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-16 border-b border-base">
                <div>
                  <h1 className="text-4xl md:text-6xl font-sans font-bold tracking-tight mb-2">Technical Analysis Daybook</h1>
                  <p className="text-lg text-text-dim">Record, categorize, and tracks your mathematical patterns and signals</p>
                </div>
                {user && (
                  <div className="flex items-center gap-4 bg-surface p-4 rounded border border-base">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-text-dim flex items-center gap-1.5 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isLocal ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        {user.isLocal ? 'Local Sandbox' : 'Cloud Remote'}
                      </p>
                      <p className="text-sm font-bold text-text-main">
                        {user.nickname || user.email.split('@')[0]}
                        <span className="text-xs text-text-dim font-normal block font-mono">{user.email}</span>
                      </p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="p-2 text-text-dim hover:text-accent hover:bg-bg rounded transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {!user ? (
                /* Interactive elegant Authentication Screen */
                <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-center">
                  <div className="space-y-8">
                    <div className="text-xs font-bold tracking-[0.3em] text-accent uppercase">
                      Security & Alignment
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                      Protect your algorithmic signals in the Cloud.
                    </h2>
                    <p className="text-lg text-text-dim leading-relaxed">
                      This dedicated technical diary holds your custom market indicators secure and isolated. Sync formulas processed in your advanced trading terminal with absolute mathematical persistence.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Strict Zero-Trust Separation</h4>
                          <p className="text-xs text-text-dim mt-1">Every entry is strictly isolated using dynamic Firebase user tokens preventing cross-account exposure.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Terminal Bridge Integration</h4>
                          <p className="text-xs text-text-dim mt-1">Analyse signals inside your custom terminal app, then return here to securely log index formulas and indicators.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                          {isFirebaseActive ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">
                            {isFirebaseActive ? "Cloud Infrastructure Online" : "Local Sandbox Environment Active"}
                          </h4>
                          <p className="text-xs text-text-dim mt-1">
                            {isFirebaseActive 
                              ? "Live remote database syncing is fully operational across safe regional servers." 
                              : "Local state persists safely inside your browser workspace. (Accept terms in AI Studio to connect Cloud Auth/Firestore)."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface p-12 rounded border border-base">
                    <div className="flex gap-4 mb-10 border-b border-base">
                      <button 
                        onClick={() => { setAuthMode("login"); setAuthError(null); setAuthSuccess(null); }}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${authMode === "login" ? "border-accent text-text-main" : "border-transparent text-text-dim"}`}
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => { setAuthMode("register"); setAuthError(null); setAuthSuccess(null); }}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${authMode === "register" ? "border-accent text-text-main" : "border-transparent text-text-dim"}`}
                      >
                        Register Tab
                      </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-8">
                      {authError && (
                        <div className="space-y-4">
                          <div className="p-4 bg-accent/10 border-l-4 border-accent rounded text-xs leading-relaxed flex flex-col gap-2 text-text-main">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <span className="font-bold">Credential Authorization Blocked</span>
                            </div>
                            <div className="pl-7 text-xs text-text-dim">
                              {authError.includes("auth/operation-not-allowed") || authError.includes("operation-not-allowed") ? (
                                <div className="space-y-3">
                                  <p>
                                    Firebase Auth returned <strong>operation-not-allowed</strong>. This means the <strong>Email/Password Sign-In Provider is disabled</strong> by default in your Firebase Cloud Console.
                                  </p>
                                  <div className="p-3 bg-bg border border-base rounded text-[11px] leading-relaxed text-text-main space-y-1">
                                    <p className="font-bold uppercase tracking-wider text-[9px] text-accent mb-1.5">How to enable in Firebase Console:</p>
                                    <p>1. Open your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-accent font-semibold">Firebase Console</a></p>
                                    <p>2. Select project <strong>coherent-archway-gsjh2</strong></p>
                                    <p>3. Go to <strong>Build &gt; Authentication &gt; Sign-in method</strong></p>
                                    <p>4. Add <strong>Email/Password</strong>, toggle <strong>Enable</strong>, and click <strong>Save</strong></p>
                                  </div>
                                </div>
                              ) : (
                                <span>{authError}</span>
                              )}
                            </div>
                          </div>

                          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded text-xs space-y-3">
                            <div className="flex items-center gap-2 text-amber-500 font-bold">
                              <Zap className="w-4 h-4" />
                              <span>Instant Sandbox Connection Available</span>
                            </div>
                            <p className="text-text-dim text-[11px] leading-relaxed">
                              You do not need to wait for Firebase setup! Skip cloud errors now and log records safely to your local web browser sandbox state.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleToggleForceLocal(true)}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 rounded font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
                            >
                              🔌 Switch to Local Sandbox Mode
                            </button>
                          </div>
                        </div>
                      )}

                      {authSuccess && (
                        <div className="p-4 bg-emerald-500/15 border-l-4 border-emerald-500 rounded text-xs leading-relaxed flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-text-main">{authSuccess}</span>
                        </div>
                      )}

                      {authMode === "register" && (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider mb-3 text-text-dim">Your Nickname</label>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. CaptainTrader"
                              value={authNickname}
                              onChange={(e) => setAuthNickname(e.target.value)}
                              className="w-full bg-bg border border-base rounded py-3 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-accent"
                            />
                          </div>
                          <p className="text-[10px] text-text-dim mt-2 font-mono">Will be saved to your diary profile</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-3 text-text-dim">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                          <input 
                            type="email" 
                            required
                            placeholder="e.g. trader@stockholm.com"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full bg-bg border border-base rounded py-3 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-3 text-text-dim">Passcode</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                          <input 
                            type="password" 
                            required
                            placeholder="••••••"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full bg-bg border border-base rounded py-3 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2.5">
                          <p className="text-[10px] text-text-dim font-mono">At least 6 characters</p>
                          {authMode === "login" && (
                            <button
                              type="button"
                              onClick={handleRecoverPassword}
                              disabled={authLoading}
                              className="text-[10px] font-bold text-accent uppercase tracking-wider hover:underline bg-transparent border-0 cursor-pointer disabled:opacity-55"
                            >
                              Forgot Passcode? Recover
                            </button>
                          )}
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-accent text-text-inv py-4 rounded font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {authLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Authorizing...
                          </>
                        ) : authMode === "login" ? "Authorize Entry" : "Register Credentials"}
                      </button>
                    </form>

                    <div className="mt-8 border-t border-base pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-text-dim block mb-0.5">Active Sync Engine</span>
                        <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isUsingFirebase ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                          {isUsingFirebase ? "Firebase Cloud Live Sync" : "Local Sandbox Environment Mode"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleForceLocal(!isUsingFirebase)}
                        className={`px-3.5 py-2 rounded text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                          isUsingFirebase 
                            ? 'bg-bg hover:bg-neutral-800 text-text-dim border-base' 
                            : 'bg-accent/15 border-accent text-accent hover:bg-accent/25'
                        }`}
                      >
                        {isUsingFirebase ? "Bypass Cloud & Run Local" : "Switch to Firebase Cloud"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Authenticated State Panel - Bento Log structure */
                <div className="grid lg:grid-cols-[1.1fr_1.5fr] gap-16 items-start">
                  
                  {/* Left Column: Form & Tools */}
                  <div className="space-y-12">
                    {/* Launch Terminal card */}
                    <div className="p-8 bg-text-main text-bg rounded-lg flex items-center justify-between gap-6 shadow-sm">
                      <div>
                        <h4 className="text-xl font-bold tracking-tight">Active Analysis Terminal</h4>
                        <p className="text-xs opacity-80 mt-1">Determine prices/cross lines on Vercel</p>
                      </div>
                      <a 
                        href="https://beta-version-test-app-ktki.vercel.app/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-bg text-text-main px-4 py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-accent hover:text-text-inv transition-all"
                      >
                        Open
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Form Card */}
                    <div className="p-8 bg-surface rounded border border-base">
                      <div className="flex items-center gap-2 mb-6 text-accent">
                        <Plus className="w-5 h-5 animate-pulse" />
                        <h3 className="font-sans font-bold text-lg uppercase tracking-wider">New Indicator Record</h3>
                      </div>

                      {saveSuccess && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 text-xs rounded">
                          <p className="font-bold text-emerald-500">Record Saved Successfully</p>
                          <p className="text-[10px] text-text-dim mt-0.5">Your parameters have been logged into your secure account diary.</p>
                        </div>
                      )}

                      <form onSubmit={handleSaveEntry} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-text-dim">Analysis Date</label>
                            <input 
                              type="date"
                              required
                              value={diaryForm.date}
                              onChange={(e) => setDiaryForm(prev => ({ ...prev, date: e.target.value }))}
                              className="w-full bg-bg border border-base rounded p-3 text-xs font-semibold focus:outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-text-dim">Crypto (e.g. TON-USD)</label>
                            <input 
                              type="text"
                              required
                              placeholder="TON-USD"
                              value={diaryForm.cryptoName}
                              onChange={(e) => setDiaryForm(prev => ({ ...prev, cryptoName: e.target.value }))}
                              className="w-full bg-bg border border-base rounded p-3 text-xs font-semibold focus:outline-none focus:border-accent uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-text-dim">Close Price (USD)</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. 1.89 USD"
                            value={diaryForm.closePrice}
                            onChange={(e) => setDiaryForm(prev => ({ ...prev, closePrice: e.target.value }))}
                            className="w-full bg-bg border border-base rounded p-3 text-xs font-semibold focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div className="border-t border-base pt-6">
                          <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent mb-4">Moving Averages</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-text-dim mb-1.5">EMA 50</label>
                              <input 
                                type="text"
                                placeholder="e.g. 1.32"
                                value={diaryForm.ema50}
                                onChange={(e) => setDiaryForm(prev => ({ ...prev, ema50: e.target.value }))}
                                className="w-full bg-bg border border-base rounded p-2.5 text-xs focus:outline-none focus:border-accent font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-text-dim mb-1.5">EMA 200</label>
                              <input 
                                type="text"
                                placeholder="e.g. 1.56"
                                value={diaryForm.ema200}
                                onChange={(e) => setDiaryForm(prev => ({ ...prev, ema200: e.target.value }))}
                                className="w-full bg-bg border border-base rounded p-2.5 text-xs focus:outline-none focus:border-accent font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-text-dim mb-1.5">SMA 50</label>
                              <input 
                                type="text"
                                placeholder="e.g. 1.30"
                                value={diaryForm.sma50}
                                onChange={(e) => setDiaryForm(prev => ({ ...prev, sma50: e.target.value }))}
                                className="w-full bg-bg border border-base rounded p-2.5 text-xs focus:outline-none focus:border-accent font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-text-dim mb-1.5">SMA 200</label>
                              <input 
                                type="text"
                                placeholder="e.g. 1.54"
                                value={diaryForm.sma200}
                                onChange={(e) => setDiaryForm(prev => ({ ...prev, sma200: e.target.value }))}
                                className="w-full bg-bg border border-base rounded p-2.5 text-xs focus:outline-none focus:border-accent font-sans"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-base pt-6">
                          <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent mb-4">Indicators & Extremes</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-text-dim mb-1.5">MACD</label>
                              <input 
                                type="text"
                                placeholder="e.g. 0.07"
                                value={diaryForm.macd}
                                onChange={(e) => setDiaryForm(prev => ({ ...prev, macd: e.target.value }))}
                                className="w-full bg-bg border border-base rounded p-2.5 text-xs focus:outline-none focus:border-accent font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-text-dim mb-1.5">RSI</label>
                              <input 
                                type="text"
                                placeholder="e.g. 85.08"
                                value={diaryForm.rsi}
                                onChange={(e) => setDiaryForm(prev => ({ ...prev, rsi: e.target.value }))}
                                className="w-full bg-bg border border-base rounded p-2.5 text-xs focus:outline-none focus:border-accent font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold uppercase text-text-dim mb-1.5">Hill (α)</label>
                              <input 
                                type="text"
                                placeholder="e.g. 1.84"
                                value={diaryForm.hillEstimator}
                                onChange={(e) => setDiaryForm(prev => ({ ...prev, hillEstimator: e.target.value }))}
                                className="w-full bg-bg border border-base rounded p-2.5 text-xs focus:outline-none focus:border-accent font-sans"
                              />
                            </div>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={saveLoading}
                          className="w-full bg-accent text-text-inv py-4 rounded font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                        >
                          {saveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Save to Diary
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Column: Historical Logs */}
                  <div className="space-y-8 bg-surface p-8 md:p-12 rounded border border-base">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h3 className="font-sans font-bold text-xl uppercase tracking-wider">Formula History Log</h3>
                      
                      <div className="relative shrink-0 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                        <input 
                          type="text"
                          placeholder="Search asset or date..."
                          value={diarySearch}
                          onChange={(e) => setDiarySearch(e.target.value)}
                          className="w-full bg-bg border border-base rounded py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    {isLoadingEntries ? (
                      <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                        <span className="text-sm font-semibold text-text-dim uppercase tracking-wider">Connecting safe database...</span>
                      </div>
                    ) : filteredEntries.length === 0 ? (
                      <div className="py-24 text-center border-2 border-dashed border-base rounded-lg px-8">
                        <TrendingUp className="w-12 h-12 text-text-dim mx-auto mb-6 opacity-35" />
                        <p className="font-bold mb-1">No Entries Recorded</p>
                        <p className="text-sm text-text-dim">Use the left form to log your today's indicators or search filters.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                        {filteredEntries.map((entry) => (
                          <motion.div 
                            key={entry.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-bg p-6 rounded border border-base group relative hover:border-accent transition-colors"
                          >
                            <div className="flex items-center justify-between mb-4 border-b border-base/40 pb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold bg-accent/15 text-accent px-2.5 py-1 rounded">
                                  {entry.cryptoName}
                                </span>
                                <span className="text-xs text-text-dim font-mono">{entry.date}</span>
                              </div>
                              <button 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className={`transition-all p-1.5 flex items-center gap-1 rounded text-xs ${
                                  deletingId === entry.id 
                                    ? "text-rose-500 bg-rose-500/10 px-2 opacity-100 font-bold" 
                                    : "text-text-dim hover:text-accent opacity-45 group-hover:opacity-100"
                                }`}
                                title={deletingId === entry.id ? "Click again to confirm delete" : "Delete Record"}
                              >
                                {deletingId === entry.id ? (
                                  <>
                                    <span className="text-[9px] uppercase tracking-wider">Confirm Delete?</span>
                                    <Trash2 className="w-3.5 h-3.5 animate-pulse" />
                                  </>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            <p className="text-sm text-text-dim mb-4">
                              Logged static Close Price: <span className="text-text-main font-bold font-mono">{entry.closePrice}</span>
                            </p>

                            {/* Indicators Grid */}
                            <div className="grid grid-cols-3 gap-y-3.5 gap-x-2 text-[10px] bg-surface/50 p-3 rounded">
                              <div>
                                <span className="block text-text-dim uppercase">EMA 50</span>
                                <span className="font-semibold font-mono text-text-main">{entry.ema50 || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-text-dim uppercase">EMA 200</span>
                                <span className="font-semibold font-mono text-text-main">{entry.ema200 || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-text-dim uppercase">SMA 50</span>
                                <span className="font-semibold font-mono text-text-main">{entry.sma50 || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-text-dim uppercase">SMA 200</span>
                                <span className="font-semibold font-mono text-text-main">{entry.sma200 || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-text-dim uppercase">MACD</span>
                                <span className="font-semibold font-mono text-text-main text-emerald-500 font-bold">{entry.macd || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-text-dim uppercase">RSI</span>
                                <span className="font-semibold font-mono text-text-main text-rose-500 font-bold">{entry.rsi || "—"}</span>
                              </div>
                              <div>
                                <span className="block text-text-dim uppercase">Hill (α)</span>
                                <span className="font-semibold font-mono text-accent font-bold">{entry.hillEstimator || "—"}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeView !== "reports" ? (
             <motion.div
               key={activeView}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="max-w-4xl mx-auto"
             >
               <h1 className="text-6xl md:text-8xl mb-8 leading-[1] font-bold tracking-tight">
                 {currentContent.title}
               </h1>
               <p className="text-2xl text-accent font-bold mb-16 tracking-tight uppercase">
                 {currentContent.subtitle}
               </p>
               <div className="prose prose-lg max-w-none font-sans text-text-main/90 leading-relaxed text-xl space-y-8">
                 <p>{currentContent.content}</p>
               </div>
               <button 
                  onClick={() => handleNavigate("reports")}
                  className="mt-20 flex items-center gap-3 text-text-dim hover:text-text-main transition-colors font-bold uppercase text-xs tracking-widest"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to Reports
                </button>
             </motion.div>
          ) : !selectedReport ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Swedish Inspired Hero */}
              <section className="mb-32">
                <div className="max-w-4xl">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold tracking-[0.3em] text-accent uppercase mb-8"
                  >
                    Quantitative Research & Analysis
                  </motion.div>
                  <h1 className="text-5xl md:text-7xl mb-10 leading-[1.1] font-sans font-bold tracking-tight">
                    Quantitative Strategy. <br />
                    <span className="text-text-dim">Scientific precision.</span>
                  </h1>
                  <p className="text-2xl text-text-dim max-w-2xl mb-12 leading-relaxed">
                    We apply rigorous mathematical modelling to crypto markets, identifying power-law distributions and high-liquidity entry points with minimalist precision.
                  </p>
                  <div className="flex items-center gap-8">
                    <button className="text-lg font-bold border-b-2 border-text-main pb-1 hover:text-accent hover:border-accent transition-all flex items-center gap-3">
                      View Latest Reports
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <a 
                      href="https://beta-version-test-app-ktki.vercel.app/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium opacity-50 hover:opacity-100 transition-opacity"
                    >
                      Institutional Terminal
                    </a>
                  </div>
                </div>
              </section>

              {/* Reports Grid - More Swedish Minimalist */}
              <section>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-base">
                  {REPORTS.map((report) => (
                    <motion.div
                      key={report.id}
                      variants={itemVariants}
                      className="group cursor-pointer p-12 lg:p-16 border-r border-b border-base bg-surface hover:bg-bg transition-colors duration-500"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-10">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-text-dim group-hover:text-accent transition-colors">
                            {report.asset}
                          </span>
                          <span className="text-[10px] font-medium text-text-dim uppercase tracking-widest">{report.date}</span>
                        </div>
                        <h3 className="text-4xl mb-8 group-hover:underline underline-offset-8 decoration-1 leading-tight">
                          {report.title}
                        </h3>
                        <p className="text-text-dim text-lg leading-relaxed mb-12 line-clamp-3">
                          {report.summary}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                            Read analysis <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              <button 
                onClick={() => setSelectedReport(null)}
                className="flex items-center gap-3 text-text-dim hover:text-text-main mb-16 transition-colors font-bold uppercase text-xs tracking-widest"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Archive
              </button>

              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-24">
                <article>
                  <div className="flex items-center gap-6 mb-10">
                    <span className="text-xs font-bold tracking-widest text-accent uppercase">
                      {selectedReport.asset}
                    </span>
                    <span className="w-12 h-px bg-base" />
                    <span className="text-xs font-medium text-text-dim uppercase tracking-widest">
                      Published {selectedReport.date}
                    </span>
                  </div>

                  <h1 className="text-6xl md:text-8xl mb-16 leading-[1] font-bold tracking-tight">
                    {selectedReport.title}
                  </h1>

                  <div className="mb-20 p-10 bg-accent/5 border-l-4 border-accent rounded-r-lg">
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Executive Summary</h4>
                    <p className="text-2xl font-medium leading-relaxed italic opacity-90">
                      {selectedReport.summary}
                    </p>
                  </div>

                  <div className="prose prose-lg max-w-none font-sans text-text-main/90 leading-relaxed space-y-8 text-xl">
                    {selectedReport.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-24 pt-12 border-t border-base">
                     <button className="flex items-center gap-3 font-bold text-sm tracking-widest uppercase hover:text-accent transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share Scientific Report
                     </button>
                  </div>
                </article>

                <aside>
                  <div className="sticky top-40 space-y-12">
                    <div className="space-y-10">
                      <div>
                        <h4 className="text-[10px] font-bold text-text-dim mb-4 uppercase tracking-[0.2em]">Asset Performance</h4>
                        <div className="space-y-6">
                           <div className="flex justify-between items-end border-b border-base pb-4">
                              <span className="text-sm font-medium text-text-dim">Current Value</span>
                              <span className="text-2xl font-bold">{selectedReport.currentPrice}</span>
                           </div>
                           <div className="flex justify-between items-end border-b border-base pb-4">
                              <span className="text-sm font-medium text-text-dim">Annualized Vol</span>
                              <span className="text-2xl font-bold text-accent">{selectedReport.volatility}</span>
                           </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-text-dim mb-6 uppercase tracking-[0.2em]">Technical Range (360D)</h4>
                        <div className="flex items-center gap-4 justify-between mb-2">
                            <span className="text-[10px] font-bold">{selectedReport.minPrice}</span>
                            <span className="text-[10px] font-bold">{selectedReport.maxPrice}</span>
                        </div>
                        <div className="h-2 bg-base rounded-full relative overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "65%" }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="absolute left-[15%] h-full bg-accent" 
                            />
                        </div>
                      </div>
                    </div>

                    <div className="p-12 bg-text-main text-bg rounded-lg">
                      <h4 className="text-3xl font-bold mb-4 tracking-tight leading-none underline decoration-accent decoration-4">Advanced Terminal</h4>
                      <p className="text-lg opacity-80 mb-10 font-medium leading-relaxed">Access full algorithmic signals and HFT data feeds.</p>
                      <a 
                        href="https://beta-version-test-app-ktki.vercel.app/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-bg text-text-main py-5 rounded font-bold flex items-center justify-center gap-3 hover:bg-accent hover:text-text-inv transition-all inline-flex"
                      >
                        Launch Application
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-base mt-40 pt-32 pb-16 bg-surface px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
                  <BarChart3 className="text-text-inv w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight uppercase">FINANCIAL <span className="font-light tracking-widest text-accent">MODELLING</span></span>
              </div>
              <p className="text-text-dim text-xl max-w-sm mb-10 leading-relaxed">
                Precision technical analysis for high-stakes digital asset trading.
              </p>
            </div>
            <div>
              <h4 className="text-text-main font-bold mb-8 uppercase tracking-[0.2em] text-xs">Research</h4>
              <ul className="space-y-6 text-sm font-medium text-text-dim">
                <li><button onClick={() => handleNavigate("reports")} className="hover:text-accent transition-colors">Market Reports</button></li>
                <li><button onClick={() => handleNavigate("indicator_theory")} className="hover:text-accent transition-colors">Indicator Theory</button></li>
                <li><button onClick={() => handleNavigate("risk_assessment")} className="hover:text-accent transition-colors">Risk Assessment</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-text-main font-bold mb-8 uppercase tracking-[0.2em] text-xs">Access</h4>
              <ul className="space-y-6 text-sm font-medium text-text-dim">
                <li><button onClick={() => handleNavigate("api")} className="hover:text-accent transition-colors">Developer API</button></li>
                <li><button onClick={() => handleNavigate("desktop")} className="hover:text-accent transition-colors">Desktop App</button></li>
                <li><button onClick={() => handleNavigate("enterprise")} className="hover:text-accent transition-colors">Enterprise</button></li>
                <li><button onClick={() => handleNavigate("terms")} className="hover:text-accent transition-colors">Terms & Conditions</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-base flex flex-col md:flex-row justify-between gap-8">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">
              © 2026 FINANCIAL MODELLING GROUP / AB STOCKHOLM
            </p>
            <div className="flex gap-12">
               <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">Privacy Policy</span>
               <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
