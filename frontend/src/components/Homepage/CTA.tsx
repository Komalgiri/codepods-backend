import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiSparkles } from 'react-icons/hi2';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#161b22] to-[#0d1117] p-12 md:p-20 text-center border border-white/5"
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 blur-[100px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-ai-start/10 blur-[100px] -z-10 rounded-full" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest mb-8"
          >
            <HiSparkles className="w-4 h-4" />
            Limited Time Beta Access
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            Ready to Upgrade Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai-end">
              Developer Workflow?
            </span>
          </h2>

          <p className="text-muted text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Join 2,000+ top-tier devs shipping faster, smarter,
            and more collaboratively with CodePods.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="group px-10 py-5 bg-primary text-white font-black rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(88,166,154,0.3)] hover:shadow-[0_0_30px_rgba(88,166,154,0.5)] flex items-center gap-3"
            >
              Launch Your First Pod
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs font-medium text-muted uppercase tracking-widest">
              No Credit Card Required
            </p>
          </div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>
    </section>
  );
};

export default CTA;
