import React from "react";
import { motion } from "framer-motion";
import TiltCard from "./TiltCard";

const services = [
    {
        num: "01",
        title: "Graphic Design",
        desc: "Visual storytelling with a focus on bold aesthetics. I create brand systems and assets that command attention and define your unique identity.",
        icon: "✦",
    },
    {
        num: "02",
        title: "Pixel Art",
        desc: "Hand-crafted, low-fidelity charm with high-fidelity precision. I specialize in character design, environments, and sprite animations.",
        icon: "⬡",
    },
    {
        num: "03",
        title: "Game Development",
        desc: "Bringing worlds to life through code and mechanics. From concept to deployment, I build engaging interactive experiences.",
        icon: "△",
    },
    {
        num: "04",
        title: "Front-End",
        desc: "Turning designs into performant, accessible code. I build responsive interfaces with smooth interactions and clean architecture.",
        icon: "◈",
    },
];

const Features = () => {
    return (
        <section id="features" className="py-24 md:py-32 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <span className="text-white/30 font-geist-mono text-xs uppercase tracking-[0.3em]">
            // expertise
                    </span>
                    <h2 className="mt-4 text-4xl md:text-6xl font-extrabold font-geist text-white leading-[0.95]">
                        What I do<span className="text-teal-400">.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s, i) => (
                        <motion.div
                            key={s.num}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                        >
                            <TiltCard className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 md:p-10 h-full cursor-pointer">
                                <div className="flex items-start justify-between mb-6">
                                    <span className="text-4xl text-emerald-400/80">{s.icon}</span>
                                    <span className="text-white/10 font-geist-mono text-xs tracking-widest">
                                        {s.num}
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold font-geist text-white mb-4 group-hover:text-emerald-400 transition-colors duration-300">
                                    {s.title}
                                </h3>
                                <p className="text-white/40 text-sm leading-relaxed font-geist">
                                    {s.desc}
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-white/20 group-hover:text-emerald-400 transition-colors">
                                    <span className="text-xs font-geist-mono uppercase tracking-wider">View projects</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </div>
                            </TiltCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;