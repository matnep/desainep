import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { label: "Work", href: "#portfolio" },
    { label: "Services", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Pricing", href: "#pricing" },
];

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const lastScroll = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            // Show after scrolling down past hero
            if (current > 100) {
                setVisible(true);
            } else {
                setVisible(false);
            }
            lastScroll.current = current;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <motion.div
                initial={false}
                animate={{
                    opacity: visible ? 1 : 0,
                    y: visible ? 0 : -60,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 px-4"
                style={{ pointerEvents: visible ? "auto" : "none" }}
            >
                <nav className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border bg-white/10 backdrop-blur-2xl border-white/15 shadow-2xl shadow-black/20 w-full max-w-3xl">
                    {/* Logo */}
                    <a href="#home" className="flex items-center gap-2 pl-2 shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                            <span className="text-black font-bold text-xs font-geist-mono">D.</span>
                        </div>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 text-[13px] text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 font-geist font-medium"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <a
                        href="#contact"
                        className="hidden md:inline-flex items-center justify-center px-5 py-2 bg-white text-black text-[13px] font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 font-geist"
                    >
                        Contact
                    </a>

                    {/* Hamburger */}
                    <button
                        className="md:hidden flex flex-col gap-[5px] cursor-pointer p-2 pr-1"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <motion.span
                            animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                            className="block w-5 h-[1.5px] bg-white rounded-full origin-center"
                        />
                        <motion.span
                            animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                            className="block w-5 h-[1.5px] bg-white rounded-full"
                        />
                        <motion.span
                            animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                            className="block w-5 h-[1.5px] bg-white rounded-full origin-center"
                        />
                    </button>
                </nav>
            </motion.div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {mobileOpen && visible && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-20 left-4 right-4 z-50 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 md:hidden shadow-2xl shadow-black/30"
                    >
                        {navLinks.map((link, i) => (
                            <motion.a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="block py-3 px-3 text-lg font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all font-geist"
                            >
                                {link.label}
                            </motion.a>
                        ))}
                        <a
                            href="#contact"
                            onClick={() => setMobileOpen(false)}
                            className="block mt-2 text-center py-3 bg-white text-black text-sm font-semibold rounded-xl font-geist"
                        >
                            Contact
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
