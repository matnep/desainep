import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import TiltCard from "./TiltCard";

const projects = [
    {
        title: "Luminary",
        category: "Graphic Design",
        year: "2025",
        gradient: "from-violet-600 to-fuchsia-500",
        desc: "A bespoke visual identity system including custom typography and brand guidelines for a creative studio.",
    },
    {
        title: "Nexus",
        category: "Front-End",
        year: "2025",
        gradient: "from-blue-600 to-cyan-400",
        desc: "A high-performance interactive interface built with React and Framer Motion for seamless user navigation.",
    },
    {
        title: "Ethereal",
        category: "Pixel Art",
        year: "2024",
        gradient: "from-emerald-600 to-teal-400",
        desc: "A collection of hand-crafted environment assets and frame-by-frame character animations in 64x64 resolution.",
    },
    {
        title: "Prism",
        category: "Graphic Design",
        year: "2024",
        gradient: "from-orange-500 to-amber-400",
        desc: "Strategic promotional artwork and digital assets designed to create a cohesive and bold visual presence.",
    },
    {
        title: "Vortex",
        category: "Game Development",
        year: "2024",
        gradient: "from-rose-500 to-pink-400",
        desc: "A retro-inspired arcade shooter demo featuring custom physics, particle systems, and integrated pixel art.",
    },
    {
        title: "Zenith",
        category: "Front-End",
        year: "2025",
        gradient: "from-indigo-600 to-blue-400",
        desc: "A minimalist, responsive dashboard focused on clean data visualization and optimal performance.",
    },
];

const Portfolio = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const headingY = useTransform(scrollYProgress, [0, 1], [0, -80]);

    return (
        <section id="portfolio" className="py-24 md:py-32 bg-[#050505]" ref={containerRef}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
                <motion.div style={{ y: headingY }}>
                    <span className="text-white/30 font-geist-mono text-xs uppercase tracking-[0.3em]">
            // selected work
                    </span>
                    <h2 className="mt-4 text-4xl md:text-6xl font-extrabold font-geist text-white leading-[0.95]">
                        Featured projects<span className="text-emerald-400">.</span>
                    </h2>
                </motion.div>
            </div>

            {/* Horizontal scroll strip with TiltCards */}
            <div className="overflow-x-auto scrollbar-hide pb-8">
                <div className="flex gap-6 px-6 lg:px-8" style={{ width: "max-content" }}>
                    {projects.map((project, i) => (
                        <motion.div
                            key={project.title}
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: i * 0.08 }}
                            className="w-[340px] md:w-[420px] shrink-0"
                        >
                            <TiltCard className="group rounded-2xl overflow-hidden aspect-[4/5] bg-[#111] relative cursor-pointer">
                                {/* Gradient bg */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />

                                {/* Dot pattern */}
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                                        backgroundSize: "20px 20px",
                                    }}
                                />

                                {/* Large number watermark */}
                                <span
                                    className="absolute top-6 right-8 text-[120px] md:text-[160px] font-black font-geist text-transparent leading-none"
                                    style={{ WebkitTextStroke: "1px rgba(255,255,255,0.04)" }}
                                >
                                    {String(i + 1).padStart(2, "0")}
                                </span>

                                {/* Content at bottom */}
                                <div className="absolute inset-0 flex flex-col justify-end p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-md text-white/40 text-[10px] font-geist-mono uppercase tracking-wider">
                                            {project.category}
                                        </span>
                                        <span className="text-white/20 text-[10px] font-geist-mono">
                                            {project.year}
                                        </span>
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-bold font-geist text-white mb-3">
                                        {project.title}
                                    </h3>

                                    <p className="text-white/0 group-hover:text-white/40 text-sm font-geist leading-relaxed transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                        {project.desc}
                                    </p>

                                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Scroll hint */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-white/15 text-[10px] font-geist-mono tracking-widest uppercase">
                    Drag or scroll →
                </span>
                <div className="h-px w-16 bg-gradient-to-r from-white/5 to-transparent" />
            </div>
        </section>
    );
};

export default Portfolio;
