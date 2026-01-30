import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineCubeTransparent } from 'react-icons/hi2';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#0D1117]/60 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <HiOutlineCubeTransparent className="w-8 h-8 text-primary" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            CodePods
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {['Features', 'Marketplace', 'Pricing', 'Docs'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-black text-muted hover:text-primary transition-colors tracking-widest uppercase"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="hidden sm:block text-xs font-black text-muted hover:text-primary px-4 py-2 transition-colors uppercase tracking-widest"
          >
            Sign In
          </Link>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-6 py-2.5 bg-primary text-white text-[10px] font-black rounded-full hover:shadow-[0_0_20px_rgba(88,166,154,0.4)] transition-all active:scale-95 uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
          >
            Join The Pod
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;