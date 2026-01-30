import Navbar from "../components/Navbar";
import Hero from "../components/Homepage/Hero";
import Integrations from "../components/Homepage/Integrations";
import HowItWorks from "../components/Homepage/HowItWorks";
import Marketplace from "../components/Homepage/Marketplace";
import Features from "../components/Homepage/Features";
import Pricing from "../components/Homepage/Pricing";
import CTA from "../components/Homepage/CTA";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Integrations />
        <HowItWorks />
        <Marketplace />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
