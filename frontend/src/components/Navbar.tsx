import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-primary p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-white dark:text-slate-900 text-xl">
              deployed_code
            </span>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">CodePods</span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          {["Features", "Integrations", "Docs", "Pricing"].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            Login
          </Link>
          <Link to="/auth?mode=signup" className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-colors">
            Sign Up
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;