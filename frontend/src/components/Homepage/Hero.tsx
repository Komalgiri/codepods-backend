import { motion } from 'framer-motion';

const Hero = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center">
      <motion.div 
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase mb-8"
        variants={item}
        initial="hidden"
        animate="show"
      >
        <span className="material-symbols-outlined text-sm">rocket_launch</span>
        Now in Public Beta
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
          variants={item}
        >
          Build Better Projects{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            Together
          </span>
        </motion.h1>
  
        <motion.p 
          className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10"
          variants={item}
        >
          The collaborative developer hub that merges AI-driven roadmaps with GitHub integration.
        </motion.p>
  
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={item}
        >
          <button 
            className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-primary/20"
            aria-label="Get started with CodePods for free"
          >
            Get Started Free
          </button>
          <button 
            className="px-8 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2"
            aria-label="Watch product demo"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            Watch Demo
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
  
export default Hero;