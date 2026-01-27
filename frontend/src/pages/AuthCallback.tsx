
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubService } from '../services/githubService';
import { userService } from '../services/userService';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [step, setStep] = useState<'processing' | 'review'>('processing');
    const [techStack, setTechStack] = useState<string[]>([]);
    const [role, setRole] = useState<string>('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [customStack, setCustomStack] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);

            // Decode user to save
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const user = JSON.parse(jsonPayload);
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
                console.error("Failed to decode token", e);
            }

            // Trigger Analysis
            const analyze = async () => {
                try {
                    const result = await githubService.analyzeProfile();
                    setTechStack(result.techStack);
                    setRole(result.inferredRole || 'Developer');
                    setAnalysis(result.roleAnalysis);
                    setStep('review');
                } catch (error) {
                    console.error("Analysis failed", error);
                    navigate('/create-pod'); // Fallback
                }
            };
            analyze();

        } else {
            navigate('/auth');
        }
    }, [searchParams, navigate]);

    const handleAddStack = () => {
        if (customStack && !techStack.includes(customStack)) {
            setTechStack([...techStack, customStack]);
            setCustomStack('');
        }
    };

    const handleSave = async () => {
        try {
            await userService.updateProfile({
                techStack,
                inferredRole: role
            });
            navigate('/dashboard?onboarding=complete');
        } catch (error) {
            console.error("Failed to save profile", error);
        }
    };

    if (step === 'processing') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-text-primary font-sans">
                <div className="text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-bold animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                        Analyzing your GitHub Profile...
                    </h2>
                    <p className="text-text-secondary">Detecting your tech stack and expertise level.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
            <div className="max-w-2xl w-full bg-background-surface border border-background-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-500 mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-text-primary">Profile Synced Successfully!</h2>
                        <p className="text-text-secondary">
                            We've analyzed your repositories and created a profile for you.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Role Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                                Your Detected Role
                            </label>
                            <div className="relative group">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-background/50 border border-background-border rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium text-lg"
                                >
                                    <option value="Frontend Developer">Frontend Developer</option>
                                    <option value="Backend Developer">Backend Developer</option>
                                    <option value="Fullstack Developer">Fullstack Developer</option>
                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                    <option value="Mobile Developer">Mobile Developer</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Why this role? Section */}
                            {analysis && (
                                <div className="p-4 rounded-xl bg-background/30 border border-background-border/50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-700">
                                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        WHY THIS ROLE?
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed italic">
                                        "{analysis.reason}"
                                    </p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {analysis.languages.map((lang: any) => (
                                            <div key={lang.name} className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-xs font-medium text-text-primary">{lang.name}</span>
                                                <span className="text-[10px] text-text-secondary">{lang.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-1 shadow-inner w-full bg-background-border/30 overflow-hidden rounded-full flex">
                                        {analysis.languages.map((lang: any, i: number) => (
                                            <div
                                                key={lang.name}
                                                style={{ width: `${lang.percentage}%`, opacity: 1 - (i * 0.15) }}
                                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tech Stack Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                                Tech Stack
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {techStack.map((tech) => (
                                    <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium text-sm group hover:bg-primary/20 transition-colors cursor-default">
                                        {tech}
                                        <button
                                            onClick={() => setTechStack(techStack.filter(t => t !== tech))}
                                            className="hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customStack}
                                    onChange={(e) => setCustomStack(e.target.value)}
                                    placeholder="Add more skills (e.g. Redis)"
                                    className="flex-1 bg-background/50 border border-background-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddStack()}
                                />
                                <button
                                    onClick={handleAddStack}
                                    className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-bold transition-all"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-background-border">
                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(88,166,154,0.4)] hover:shadow-[0_0_30px_rgba(88,166,154,0.6)] transition-all transform hover:-translate-y-0.5"
                        >
                            Confirm & Continue
                        </button>
                        <p className="mt-4 text-center text-sm text-text-secondary">
                            You can always update this later in your profile settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
