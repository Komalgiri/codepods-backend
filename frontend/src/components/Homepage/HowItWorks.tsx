import { motion } from 'framer-motion';
import { HiRocketLaunch, HiCpuChip, HiChartBarSquare, HiPuzzlePiece } from 'react-icons/hi2';

const steps = [
    {
        title: "Initialize Your Pod",
        description: "Login with GitHub and create your project pod. We automatically sync your repo background and analyze the codebase structure.",
        icon: <HiRocketLaunch />,
        color: "text-blue-400",
        bg: "bg-blue-400/10"
    },
    {
        title: "AI-Driven Planning",
        description: "Our AI engine generates a tactical roadmap based on your current project state, suggesting tasks and identifying dependencies.",
        icon: <HiCpuChip />,
        color: "text-primary",
        bg: "bg-primary/10"
    },
    {
        title: "Assemble Core Team",
        description: "Invite contributors to your pod. Our system tracks team dynamics, reliability scores, and optimizes task allocation.",
        icon: <HiPuzzlePiece />,
        color: "text-purple-400",
        bg: "bg-purple-400/10"
    },
    {
        title: "Ship with Velocity",
        description: "Track progress through real-time metrics, automated syncs, and AI-powered insights that keep the momentum high.",
        icon: <HiChartBarSquare />,
        color: "text-orange-400",
        bg: "bg-orange-400/10"
    }
];

const HowItWorks = () => {
    return (
        <section className="py-24 relative overflow-hidden" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black mb-6"
                    >
                        Mastering the <span className="text-primary">Lifecycle</span>
                    </motion.h2>
                    <p className="text-muted text-lg max-w-2xl mx-auto uppercase tracking-widest font-bold">
                        The CodePods workflow engineered for precision.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group flex flex-col items-center text-center"
                            >
                                <div className={`w-20 h-20 rounded-3xl ${step.bg} ${step.color} flex items-center justify-center text-3xl mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-muted text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
