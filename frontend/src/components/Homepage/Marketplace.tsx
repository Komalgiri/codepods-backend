import { motion } from 'framer-motion';
import { HiPuzzlePiece, HiArrowTopRightOnSquare } from 'react-icons/hi2';

const extensions = [
    { name: "VS Code Plugin", description: "Seamlessly manage pods directly from your editor.", category: "Editor" },
    { name: "Slack Notifications", description: "Get real-time pod activity in your channels.", category: "Communication" },
    { name: "Jira Sync", description: "Bi-directional sync with Jira issues.", category: "Management" }
];

const Marketplace = () => {
    return (
        <section className="py-24 relative overflow-hidden" id="marketplace">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
                            Plugin <span className="text-primary">Marketplace</span>
                        </h2>
                        <p className="text-muted text-lg max-w-xl font-bold uppercase tracking-widest text-xs">
                            Extend your workflow with powerful official extensions.
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        Explore All Plugins
                        <HiArrowTopRightOnSquare className="w-4 h-4" />
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {extensions.map((ext, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-[2.5rem] bg-[#161b22]/50 border border-white/5 hover:border-primary/20 hover:bg-[#161b22] transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <HiPuzzlePiece className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-2 block">{ext.category}</span>
                            <h3 className="text-xl font-black text-white mb-4">{ext.name}</h3>
                            <p className="text-muted text-sm leading-relaxed mb-6">{ext.description}</p>
                            <button className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 uppercase tracking-widest">
                                Learn More
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Marketplace;
