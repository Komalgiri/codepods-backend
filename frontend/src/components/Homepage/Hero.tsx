import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Variants } from 'framer-motion';
import { HiArrowRight, HiCommandLine, HiChartBar, HiUsers, HiCpuChip } from 'react-icons/hi2';

const Hero = () => {
  const navigate = useNavigate();
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const suggestions = [
    "Optimize pod resource allocation for High-Velocity Dev",
    "Auto-generate testing suite for /api/v1/auth",
    "Identify circular dependency in core-logic module",
    "Suggest collaborative pod for frontend-react-fix"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 text-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ai-start/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            codepodai v1.0 is now live
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            Scale Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-ai-end">
              Software Pods
            </span> <br />
            with AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-2xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Automated AI planning merged with GitHub operations. <br />
            Built for high-velocity engineering teams shipping world-class infra.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto"
          >
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="group relative px-10 py-5 bg-primary text-white font-black rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(88,166,154,0.3)] hover:shadow-[0_0_30px_rgba(88,166,154,0.5)] flex items-center gap-2 uppercase tracking-widest text-xs"
            >
              Get Started Free
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pricing');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md text-foreground border border-white/10 rounded-2xl transition-all duration-300 flex items-center gap-2 group uppercase tracking-widest text-xs font-black"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <HiChartBar className="w-4 h-4" />
              </div>
              View Pricing
            </button>
          </motion.div>
        </motion.div>

        {/* Enhanced Dashboard Preview - Denser & Data-Rich */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mt-24 w-full max-w-6xl mx-auto relative group"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-ai-start/30 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000" />

          <div className="relative aspect-[16/10] rounded-[3rem] border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl flex text-left">
            {/* Sidebar Mock */}
            <div className="w-64 border-r border-white/5 p-8 flex flex-col gap-10 bg-[#080b10]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <HiCpuChip className="text-primary w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-grow">
                  <div className="h-2 w-full bg-white/10 rounded-full" />
                  <div className="h-1.5 w-1/2 bg-white/5 rounded-full" />
                </div>
              </div>

              <div className="space-y-6">
                {['Analytics', 'Deployments', 'Team', 'Security'].map((label, i) => (
                  <div key={i} className="flex items-center gap-4 group/item cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-white/5 group-hover/item:bg-white/10 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover/item:text-white transition-colors">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto p-5 bg-primary/5 rounded-[2rem] border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/20" />
                  <div className="space-y-1">
                    <div className="h-1.5 w-16 bg-white/10 rounded-full" />
                    <div className="h-1 w-10 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary rounded-full shadow-[0_0_10px_rgba(88,166,154,0.5)]" />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow flex flex-col p-10 gap-8 bg-[#080b10]/40">
              {/* Top Stats Strip */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Reliability', val: '99.4%', icon: <HiChartBar className="text-primary" /> },
                  { label: 'Active Pods', val: '12/15', icon: <HiCommandLine className="text-ai-start" /> },
                  { label: 'Contributors', val: '24', icon: <HiUsers className="text-emerald-400" /> }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">{stat.icon}</div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Interaction Pane */}
              <div className="flex-grow flex gap-8">
                {/* Left: Intelligence Roadmap */}
                <div className="flex-[1.5] bg-[#161b22]/80 rounded-[2.5rem] border border-white/5 p-8 relative">
                  <div className="absolute top-8 right-8">
                    <div className="px-4 py-1.5 bg-ai-gradient rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 shadow-lg shadow-ai-start/20">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      AI Engine
                    </div>
                  </div>

                  <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-10">Strategic Intelligence</h4>

                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={suggestionIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 shadow-xl"
                      >
                        <p className="text-xs font-bold text-white mb-4 leading-relaxed">
                          {suggestions[suggestionIndex]}
                        </p>
                        <div className="flex gap-3">
                          <span className="text-[8px] bg-white/5 px-2.5 py-1 rounded-full text-muted uppercase font-black tracking-widest">Context: Main Branch</span>
                          <span className="text-[8px] bg-primary/10 px-2.5 py-1 rounded-full text-primary uppercase font-black tracking-widest">Recommended Fix</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="space-y-4 opacity-30">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                          <div className="w-3 h-3 rounded-full border border-white/20" />
                          <div className="h-1.5 flex-grow bg-white/10 rounded-full" />
                          <div className="w-12 h-6 bg-white/5 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Velocity Graph */}
                <div className="flex-1 bg-[#161b22]/40 rounded-[2.5rem] border border-white/5 p-8 flex flex-col">
                  <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-8">Team Velocity</h4>

                  <div className="flex-grow flex items-end gap-2 px-2">
                    {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.6].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h * 100}%` }}
                        transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                        className="flex-grow bg-primary/40 rounded-t-lg relative group/bar hover:bg-primary transition-colors cursor-help"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                          {Math.floor(h * 100)}%
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-muted">
                      <span>Current Sprint</span>
                      <span className="text-white">+12.4%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-ai-gradient rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal Bottom Area */}
              <div className="h-20 bg-black/60 px-10 rounded-[2.5rem] border border-white/5 flex items-center gap-6 font-mono text-[10px] shadow-2xl">
                <HiCommandLine className="text-primary w-5 h-5 animate-pulse" />
                <div className="flex-grow text-white/40 overflow-hidden whitespace-nowrap">
                  <span className="text-primary tracking-widest">~/pod-93/build</span> <span className="text-white/60 italic">codepodai --predictive-plan --region=us-east</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-4 bg-primary/40 animate-blink" />
                  <span className="text-primary/20">010110</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;