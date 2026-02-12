import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
    { value: 200, suffix: "+", label: "Projects" },
    { value: 98, suffix: "%", label: "Satisfaction" },
    { value: 12, suffix: "y", label: "Experience" },
    { value: 50, suffix: "M", label: "Users Reached" },
];

const AnimatedCounter = ({ target, suffix }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return (
        <span ref={ref} className="tabular-nums">
            {count}
            <span className="text-emerald-400">{suffix}</span>
        </span>
    );
};

const About = () => {
    return (
        <section id="about" className="py-24 md:py-40 bg-[#0a0a0a] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Stats strip */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-white/5 mb-20"
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-[#0a0a0a] p-8 md:p-10 text-center">
                            <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-geist text-white">
                                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                            </span>
                            <p className="text-white/20 text-xs font-geist-mono uppercase tracking-widest mt-3">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* About content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-white/30 font-geist-mono text-xs uppercase tracking-[0.3em]">
              // about
                        </span>
                        <h2 className="mt-4 text-4xl md:text-6xl font-extrabold font-geist text-white leading-[0.95]">
                            We don't do ordinary<span className="text-emerald-400">.</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <p className="text-white/40 text-lg leading-relaxed font-geist">
                            We're a collective of designers, engineers, and dreamers who believe
                            the digital world deserves more than templates and trends. Every project
                            is a chance to create something that's never existed before.
                        </p>
                        <p className="text-white/40 text-lg leading-relaxed font-geist">
                            From brand identity to full-stack platforms, we build with intention,
                            obsess over details, and deliver work that moves people.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <a href="#portfolio" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-full hover:bg-white/90 transition-all font-geist">
                                See our work
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
