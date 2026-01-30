import { HiOutlineCubeTransparent } from 'react-icons/hi2';
import { SiGithub, SiX, SiDiscord, SiLinkedin } from 'react-icons/si';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Product",
      links: ["Features", "Security", "Marketplace", "Pricing"]
    },
    {
      title: "Resources",
      links: ["Documentation", "API Reference", "Changelog", "Status"]
    },
    {
      title: "Company",
      links: ["About", "Careers", "Privacy", "Terms"]
    }
  ];

  return (
    <footer className="bg-[#080b10] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6 pointer-events-none">
              <HiOutlineCubeTransparent className="w-8 h-8 text-primary" />
              <span className="text-2xl font-black tracking-tighter text-white">CodePodAI</span>
            </div>
            <p className="text-muted text-sm leading-relaxed max-w-xs mb-8">
              High-velocity orchestration for modern development teams.
              Build, scale, and ship smarter with CodePodAI.
            </p>
            <div className="flex items-center gap-5">
              {[SiGithub, SiX, SiDiscord, SiLinkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="text-muted hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a href="#" className="text-muted hover:text-primary text-sm transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted/60 text-xs font-bold tracking-widest uppercase">
            © {currentYear} CodePodAI Inc. Crafted with precision for devs.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-muted/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
