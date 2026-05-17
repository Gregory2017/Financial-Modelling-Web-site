/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
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
  Moon
} from "lucide-react";
import { REPORTS, Report, PAGES_CONTENT } from "./constants";

type Theme = "nordic" | "nordic-dark" | "stockholm";
type View = "reports" | "methodology" | "contact" | "indicator_theory" | "risk_assessment" | "api" | "desktop" | "enterprise";

export default function App() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeView, setActiveView] = useState<View>("reports");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("stockholm");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "nordic" ? "" : theme);
  }, [theme]);

  const handleNavigate = (view: View) => {
    setActiveView(view);
    setSelectedReport(null);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentContent = useMemo(() => {
    if (activeView === "reports") return null;
    return (PAGES_CONTENT as any)[activeView];
  }, [activeView]);

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
          {activeView !== "reports" ? (
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
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-base flex flex-col md:flex-row justify-between gap-8">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">
              © 2026 FINANCIAL MODELLING GROUP / AB STOCKHOLM
            </p>
            <div className="flex gap-12">
               <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] cursor-pointer hover:text-text-main">Privacy</span>
               <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] cursor-pointer hover:text-text-main">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
