import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiGithub, SiSlack, SiGitlab, SiDocker, SiJira } from 'react-icons/si';
import { VscCode } from 'react-icons/vsc';

const integrations = [
  { name: "GitHub", icon: <SiGithub />, color: "text-[#ffffff]" },
  { name: "VS Code", icon: <VscCode />, color: "text-[#007ACC]" },
  { name: "Slack", icon: <SiSlack />, color: "text-[#4A154B]" },
  { name: "GitLab", icon: <SiGitlab />, color: "text-[#FC6D26]" },
  { name: "Docker", icon: <SiDocker />, color: "text-[#2496ED]" },
  { name: "Jira", icon: <SiJira />, color: "text-[#0052CC]" },
];

const Integrations = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % integrations.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="py-24 border-t border-white/5 bg-black/20" id="integrations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted/60 mb-16 text-center">
            Engineered for your Ecosystem
          </h2>

          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 md:gap-12 items-center justify-center w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {integrations.map((item, idx) => {
              const isActive = activeIndex === idx;

              return (
                <motion.div
                  key={idx}
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -10 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className={`flex flex-col items-center gap-5 cursor-pointer relative group`}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className={`text-4xl md:text-5xl transition-colors duration-500 ${isActive ? item.color : 'text-muted'}`}>
                    {item.icon}
                  </div>

                  <div className="h-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className={`text-[10px] font-black tracking-widest uppercase ${item.color}`}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className={`absolute -inset-4 bg-gradient-to-t filter blur-2xl opacity-10 rounded-full z-[-1] pointer-events-none ${item.color.replace('text-', 'from-')}`}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Integrations;
