import { motion } from 'framer-motion';
import { SiGithub, SiSlack, SiGitlab, SiDocker, SiJira } from 'react-icons/si';
import { VscCode } from 'react-icons/vsc';

const integrations = [
  { name: "GitHub", icon: <SiGithub />, color: "hover:text-[#ffffff]" },
  { name: "VS Code", icon: <VscCode />, color: "hover:text-[#007ACC]" },
  { name: "Slack", icon: <SiSlack />, color: "hover:text-[#4A154B]" },
  { name: "GitLab", icon: <SiGitlab />, color: "hover:text-[#FC6D26]" },
  { name: "Docker", icon: <SiDocker />, color: "hover:text-[#2496ED]" },
  { name: "Jira", icon: <SiJira />, color: "hover:text-[#0052CC]" },
];

const Integrations = () => {
  return (
    <section className="py-24 border-t border-white/5 bg-black/20" id="integrations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted/60 mb-12 text-center">
            Engineered for your Ecosystem
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 md:gap-12 items-center justify-center">
            {integrations.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0.4 }}
                whileHover={{ opacity: 1, scale: 1.1, y: -5 }}
                className={`flex flex-col items-center gap-4 transition-all duration-300 cursor-pointer group ${item.color}`}
              >
                <div className="text-4xl md:text-5xl text-muted group-hover:text-inherit transition-colors">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Integrations;
