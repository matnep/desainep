import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CustomCursor from "./components/CustomCursor";

// Lazy load sections below the fold
const Features = lazy(() => import("./components/Features"));
const About = lazy(() => import("./components/About"));
const Portfolio = lazy(() => import("./components/Portfolio"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const Pricing = lazy(() => import("./components/Pricing"));
const Contact = lazy(() => import("./components/Contact"));
const Footer = lazy(() => import("./components/Footer"));

function App() {
  return (
    <div className="noise-overlay">
      <CustomCursor />
      <Navbar />
      <Hero />
      <Suspense fallback={null}>
        <Features />
        <About />
        <Portfolio />
        <Testimonials />
        <Pricing />
        <Contact />
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;
