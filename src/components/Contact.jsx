import React from "react";
import { motion } from "framer-motion";

const Contact = () => {
    return (
        <section id="contact" className="py-24 md:py-40 bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-8">
                    {/* Left */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <span className="text-white/30 font-geist-mono text-xs uppercase tracking-[0.3em]">
              // contact
                        </span>
                        <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold font-geist text-white leading-[0.95]">
                            Let's build
                            <br />
                            something<span className="text-emerald-400">.</span>
                        </h2>
                        <p className="mt-8 text-white/30 text-base leading-relaxed font-geist">
                            Have a project in mind? I'd love to hear about it. Drop me a
                            message and I'll get back to you within 24 hours.
                        </p>

                        <div className="mt-10 space-y-4">
                            <a href="mailto:hnifnasri@gmail.com" className="flex items-center gap-3 text-white/30 hover:text-emerald-400 transition-colors font-geist-mono text-sm">
                                <span className="text-white/10">→</span>
                                hnifnasri@gmail.com
                            </a>
                            <a href="tel:+60134600508" className="flex items-center gap-3 text-white/30 hover:text-emerald-400 transition-colors font-geist-mono text-sm">
                                <span className="text-white/10">→</span>
                                +60 13 460-0508
                            </a>
                            <span className="flex items-center gap-3 text-white/30 font-geist-mono text-sm">
                                <span className="text-white/10">→</span>
                                Alor Setar, Malaysia
                            </span>
                        </div>
                    </motion.div>

                    {/* Right — Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <form
                            className="p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/5 space-y-8"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label htmlFor="name" className="block text-[10px] font-geist-mono text-white/20 mb-3 uppercase tracking-[0.3em]">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="John Doe"
                                        className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/15 focus:outline-none focus:border-emerald-400/50 transition-colors font-geist text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-[10px] font-geist-mono text-white/20 mb-3 uppercase tracking-[0.3em]">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="john@example.com"
                                        className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/15 focus:outline-none focus:border-emerald-400/50 transition-colors font-geist text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-[10px] font-geist-mono text-white/20 mb-3 uppercase tracking-[0.3em]">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows="4"
                                    placeholder="Tell me about your project..."
                                    className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/15 focus:outline-none focus:border-emerald-400/50 transition-colors resize-none font-geist text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-full bg-white text-black font-semibold text-sm tracking-wide transition-all duration-200 hover:bg-emerald-400 hover:text-black cursor-pointer font-geist"
                            >
                                Send message
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;