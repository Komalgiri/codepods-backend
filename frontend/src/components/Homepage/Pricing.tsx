import { HiCheckCircle, HiSparkles } from 'react-icons/hi2';

const Pricing = () => {
    return (
        <section className="py-24 relative overflow-hidden" id="pricing">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-6">
                        Transparent <span className="text-primary">Pricing</span>
                    </h2>
                    <p className="text-muted text-lg max-w-2xl mx-auto uppercase tracking-widest font-bold">
                        Built by devs, for devs. No hidden fees.
                    </p>
                </div>

                <div className="max-w-lg mx-auto">
                    <div className="relative group">
                        {/* Gradient Border Glow (Subtle hover only) */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-ai-start rounded-[2.5rem] blur opacity-10 group-hover:opacity-40 transition duration-500" />

                        <div className="relative bg-[#161b22] border border-white/10 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl">
                            {/* "Free" Badge */}
                            <div className="absolute top-8 right-8">
                                <div className="px-4 py-2 bg-primary/20 border border-primary/50 text-primary rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <HiSparkles />
                                    Active Beta
                                </div>
                            </div>

                            <div className="text-left mb-10">
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Community Edition</h3>
                                <p className="text-muted text-sm font-medium">Everything you need to ship world-class pods.</p>
                            </div>

                            <div className="flex items-baseline gap-2 mb-10">
                                <span className="text-6xl font-black text-white">$0</span>
                                <span className="text-muted font-bold uppercase tracking-widest text-sm">/ Forever</span>
                            </div>

                            <div className="space-y-5 mb-12">
                                {[
                                    "Unlimited Projects (Pods)",
                                    "Advanced AI Roadmap Engine",
                                    "Full GitHub Integration",
                                    "Real-time Team Dynamics",
                                    "Shared Workspaces",
                                    "Community Support"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-text-primary/90">
                                        <HiCheckCircle className="text-primary w-5 h-5 flex-shrink-0" />
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-5 bg-white text-black font-black rounded-2xl transition-all duration-300 hover:bg-primary hover:text-white uppercase tracking-widest text-xs">
                                Start Shipping Free
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <p className="text-muted/60 text-xs font-black uppercase tracking-[0.3em]">
                        Coming Soon: Enterprise Security & Multi-Org Support
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
