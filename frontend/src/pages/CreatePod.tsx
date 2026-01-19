
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { podService } from '../services/podService';

const CreatePod = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        techStack: [] as string[],
        techStackInput: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/auth');
        }
    }, [navigate]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && formData.techStackInput.trim()) {
            e.preventDefault();
            if (!formData.techStack.includes(formData.techStackInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    techStack: [...prev.techStack, prev.techStackInput.trim()],
                    techStackInput: ''
                }));
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            techStack: prev.techStack.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await podService.createPod({
                name: formData.name,
                description: formData.description
                // Note: Tech stack is not yet supported by backend create endpoint, 
                // but we keep it in UI as requested.
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubConnect = () => {
        // Redirect to backend GitHub auth endpoint
        window.location.href = 'http://localhost:5000/api/auth/github/login';
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary selection:text-white">
            {/* Navbar for context */}
            <nav className="border-b border-background-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <span className="text-xl font-bold tracking-tight">CodePods</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                        <span className="cursor-pointer hover:text-text-primary" onClick={() => navigate('/dashboard')}>Dashboard</span>
                        <span>/</span>
                        <span className="text-text-primary">Create a Pod</span>
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary">Create a New Pod</h1>
                    <p className="text-text-secondary mt-2">Set up your collaborative workspace and link your repository.</p>
                </div>

                <div className="bg-background-surface border border-background-border rounded-2xl p-8 shadow-card">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Pod Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-bold text-text-secondary uppercase tracking-wider">
                                Pod Name
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. quantum-engine-alpha"
                                    className="w-full bg-background/50 border border-background-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-secondary pointer-events-none">
                                    codepods.io/pods/...
                                </div>
                            </div>
                            <p className="text-xs text-text-secondary">Unique identifier for your project workspace.</p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-bold text-text-secondary uppercase tracking-wider">
                                Description <span className="font-normal text-text-secondary/50">(Optional)</span>
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe what your Pod is about... (Markdown supported)"
                                className="w-full bg-background/50 border border-background-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none text-sm"
                            />
                            <div className="flex justify-between items-center text-xs text-text-secondary">
                                <span>Use markdown for styling project goals.</span>
                                <span>{formData.description.length}/500</span>
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-2">
                            <label htmlFor="techStack" className="block text-sm font-bold text-text-secondary uppercase tracking-wider">
                                Tech Stack
                            </label>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {formData.techStack.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-primary-dark"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        id="techStack"
                                        type="text"
                                        value={formData.techStackInput}
                                        onChange={(e) => setFormData({ ...formData, techStackInput: e.target.value })}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Add tech stack tags (e.g. Node.js, GraphQL, Docker)"
                                        className="w-full bg-background/50 border border-background-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (formData.techStackInput.trim()) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    techStack: [...prev.techStack, prev.techStackInput.trim()],
                                                    techStackInput: ''
                                                }));
                                            }
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="16"></line>
                                            <line x1="8" y1="12" x2="16" y2="12"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* GitHub Integration Notice */}
                        <div className={`p-4 rounded-xl border ${user.githubId ? 'bg-green-500/10 border-green-500/20' : 'bg-background/50 border-background-border'} flex gap-4`}>
                            <div className={`p-2 rounded-lg h-fit ${user.githubId ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold ${user.githubId ? 'text-green-500' : 'text-text-primary'}`}>
                                    {user.githubId ? 'GitHub Connected' : 'GitHub Integration Required'}
                                </h3>
                                <p className="text-sm text-text-secondary mt-1">
                                    {user.githubId
                                        ? 'Your GitHub account is connected. You can now create your Pod.'
                                        : 'To ensure proper synchronization, every Pod must be connected to a GitHub repository. Please connect your GitHub account to proceed.'}
                                </p>
                                {!user.githubId && (
                                    <button
                                        type="button"
                                        onClick={handleGitHubConnect}
                                        className="mt-3 text-sm font-bold text-primary hover:text-primary-dark hover:underline"
                                    >
                                        Connect GitHub Account →
                                    </button>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="pt-4 border-t border-background-border flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Cancel and Return
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !user.githubId || !formData.name}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg shadow-[0_0_20px_rgba(88,166,154,0.3)] hover:shadow-[0_0_25px_rgba(88,166,154,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating...' : 'Create Pod'}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"></path>
                                    <path d="M12 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreatePod;
