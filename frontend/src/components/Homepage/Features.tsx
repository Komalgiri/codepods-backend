import { motion } from 'framer-motion';
import { HiSquare3Stack3D, HiCpuChip, HiGlobeAlt, HiShieldCheck } from 'react-icons/hi2';

const features = [
  {
    title: "AI Project Intelligence",
    description: "Our neural engine analyzes your repository to suggest optimal roadmaps and identify potential blockers before they happen.",
    icon: <HiCpuChip className="w-6 h-6" />,
    color: "from-primary to-emerald-400"
  },
  {
    title: "Real-time Pod Sync",
    description: "Synchronize your team's workflow with precision. Tasks, commits, and PRs all living in one cohesive dashboard.",
    icon: <HiSquare3Stack3D className="w-6 h-6" />,
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "Global Collaboration",
    description: "Built for distributed teams. Manage cross-border pods with native support for time-zones and collaborative planning.",
    icon: <HiGlobeAlt className="w-6 h-6" />,
    color: "from-orange-400 to-rose-400"
  },
  {
    title: "Enterprise Security",
    description: "Your code stays yours. We use field-tested encryption and secure GitHub OAuth flows to keep your proprietary work safe.",
    icon: <HiShieldCheck className="w-6 h-6" />,
    color: "from-purple-500 to-ai-start"
  }
];

const Features = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black mb-6"
          >
            Engineered for High-Velocity Teams
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted text-lg md:text-xl max-w-2xl mx-auto"
          >
            Everything you need to ship world-class software,
            powered by AI and integrated directly with your stack.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group p-8 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/10 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted leading-relaxed text-sm">
                {feature.description}
              </p>

              <div className="absolute top-4 right-4 text-white/5 font-black text-6xl pointer-events-none select-none">
                0{idx + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
