
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Auth = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signup') {
            setIsLogin(false);
        } else {
            setIsLogin(true);
        }
    }, [searchParams]);

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setFormData({ name: '', email: '', password: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            let data;
            if (isLogin) {
                data = await authService.login(formData);
            } else {
                data = await authService.signup(formData);
            }

            // Save token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-primary selection:text-white">
            {/* Navigation */}
            <nav className="w-full border-b border-background-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="p-1 rounded-lg">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">CodePods</span>
                    </div>

                    <div className="flex gap-8 text-sm font-medium text-text-secondary">
                        <a href="#" className="hover:text-text-primary transition-colors">Docs</a>
                        <a href="#" className="hover:text-text-primary transition-colors">Community</a>
                        <a href="#" className="hover:text-text-primary transition-colors">Pricing</a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 -mt-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-primary">
                            {isLogin ? 'Welcome back, Dev' : 'Create your account'}
                        </h2>
                        <p className="mt-2 text-sm text-text-secondary">
                            {isLogin ? 'Enter the Pod and start shipping.' : 'Join the Pod and start shipping today.'}
                        </p>
                    </div>

                    <div className="mt-8 bg-background-surface border border-background-border rounded-2xl p-8 shadow-card">
                        <div className="space-y-4">
                            <button type="button" className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-transparent rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                                {isLogin ? 'Continue with GitHub' : 'Sign up with GitHub'}
                            </button>

                            <button type="button" className="w-full flex items-center justify-center gap-3 bg-background-surface hover:bg-background-border/50 text-text-primary border border-background-border rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 group">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {isLogin ? 'Continue with Google' : 'Sign up with Google'}
                            </button>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-background-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-background-surface text-text-secondary uppercase tracking-wider">
                                    {isLogin ? 'Or continue with email' : 'Or sign up with email'}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-300">
                                    <label htmlFor="name" className="block text-sm font-bold text-text-secondary">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required={!isLogin}
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-background-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-sm"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-bold text-text-secondary">
                                    Work Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-background/50 border border-background-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-bold text-text-secondary">
                                        Password
                                    </label>
                                    {isLogin && (
                                        <a href="#" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                                            Forgot password?
                                        </a>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-background/50 border border-background-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-sm"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-extrabold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-[0_0_20px_rgba(88,166,154,0.3)] hover:shadow-[0_0_25px_rgba(88,166,154,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Processing...' : (isLogin ? 'Sign In to Dashboard' : 'Create Account')}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center text-sm text-text-secondary">
                            {isLogin ? (
                                <>
                                    Don't have an account?{' '}
                                    <button type="button" onClick={toggleMode} className="font-bold text-primary hover:text-primary-dark hover:underline focus:outline-none transition-colors">
                                        Sign Up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button type="button" onClick={toggleMode} className="font-bold text-primary hover:text-primary-dark hover:underline focus:outline-none transition-colors">
                                        Sign In
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Auth;
