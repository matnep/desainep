import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
    {
        quote: "They didn't just build our website — they redefined how our customers experience our brand. The result was nothing short of transformative.",
        name: "Sarah Chen",
        role: "CEO, Luminary",
        initials: "SC",
    },
    {
        quote: "Working with this team felt like having a secret weapon. Our conversion rates tripled and the design still feels fresh two years later.",
        name: "Marcus Rivera",
        role: "Founder, Nexus",
        initials: "MR",
    },
    {
        quote: "I've worked with dozens of agencies. None have matched their combination of creative vision, technical excellence, and genuine care.",
        name: "Emma Larsson",
        role: "CTO, Prism",
        initials: "EL",
    },
];

const Testimonials = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-24 md:py-40 bg-[#0a0a0a]">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-white/30 font-geist-mono text-xs uppercase tracking-[0.3em]">
            // testimonials
                    </span>
                </motion.div>

                <div className="mt-12 md:mt-20 min-h-[280px] flex items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            <blockquote className="text-2xl md:text-4xl lg:text-5xl font-geist font-medium text-white/90 leading-[1.2] tracking-tight">
                                <span className="text-emerald-400/60">"</span>
                                {testimonials[current].quote}
                                <span className="text-emerald-400/60">"</span>
                            </blockquote>

                            <div className="mt-10 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold font-geist-mono">
                                    {testimonials[current].initials}
                                </div>
                                <div>
                                    <p className="text-white/70 font-medium font-geist text-sm">{testimonials[current].name}</p>
                                    <p className="text-white/20 font-geist-mono text-xs">{testimonials[current].role}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-2 mt-12">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer ${i === current
                                    ? "w-10 bg-emerald-400"
                                    : "w-3 bg-white/10 hover:bg-white/20"
                                }`}
                            aria-label={`Testimonial ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
