import Navbar from "../components/Navbar";
import Hero from "../components/Homepage/Hero";
import Integrations from "../components/Homepage/Integrations";
import Features from "../components/Homepage/Features";
import CTA from "../components/Homepage/CTA";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="relative overflow-hidden">
        <Hero />
        <Integrations />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
