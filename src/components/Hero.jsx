import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "./ParticleField";
import MagneticButton from "./MagneticButton";
import RocketGame from "./RocketGame";
import VictoryScreen from "./VictoryScreen";
import GameOverScreen from "./GameOverScreen";
import NebulaStars from "./NebulaStars";

const SplitText = ({ text, lineIndex }) => {
    return (
        <span>
            {text.split("").map((char, i) => {
                const floatDelay = (lineIndex * 5 + i) * 0.15;
                const floatDuration = 3 + (i % 3) * 0.5;
                return (
                    <span
                        key={i}
                        className="hero-char inline-block"
                        data-orig-anim={`heroFloat ${floatDuration}s ease-in-out ${floatDelay}s infinite`}
                        style={{
                            willChange: "transform, opacity, color",
                            animation: `heroFloat ${floatDuration}s ease-in-out ${floatDelay}s infinite`,
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                );
            })}
        </span>
    );
};

const Hero = () => {
    const textRef = useRef(null);
    const [victory, setVictory] = useState(null);
    const [showGameOver, setShowGameOver] = useState(false);
    const [gameKey, setGameKey] = useState(0);

    const handleRestart = useCallback(() => {
        setGameKey(prev => prev + 1);
        setShowGameOver(false);
        setVictory(null);
    }, []);

    return (
        <section id="home" className='relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0b0f1a]'>
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <ParticleField />
            </div>

            {/* Game Layer */}
            <div className="absolute inset-0 z-20">
                <RocketGame
                    key={gameKey}
                    textContainerRef={textRef}
                    onBossDefeated={(time) => setVictory(time)}
                    onGameOver={() => setShowGameOver(true)}
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 container mx-auto px-6 text-left pointer-events-none" ref={textRef}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-5xl"
                >
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9] font-['Geist_Mono'] select-none pointer-events-none uppercase">
                        <div className="block mb-2"><SplitText text="UNFORGETTABLE" lineIndex={0} /></div>
                        <div className="block text-emerald-400">
                            <SplitText text="BY DESIGN" lineIndex={1} />
                        </div>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-lg md:text-xl text-slate-400 mb-12 max-w-xl font-['Geist_Mono']"
                >
                    We craft interactive, high-performance websites that leave a mark.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="pointer-events-auto"
                >
                    <MagneticButton>
                        <a
                            href="#contact"
                            className="inline-flex items-center px-8 py-4 bg-white text-black font-bold rounded-full text-sm uppercase tracking-wider hover:bg-emerald-400 transition-colors duration-300 font-['Geist_Mono']"
                        >
                            Start Project
                        </a>
                    </MagneticButton>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                    className="mt-10 flex gap-4 pointer-events-auto"
                >
                    <MagneticButton className="cursor-pointer px-8 py-4 bg-white/5 text-white/60 border border-white/10 font-['Geist_Mono'] font-bold uppercase text-sm tracking-wider rounded-full flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all duration-300">
                        <a href="#features" className="flex items-center gap-2">
                            Explore Services
                        </a>
                    </MagneticButton>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-white/20 text-[10px] font-geist-mono tracking-[0.3em] uppercase">Scroll</span>
                    <div className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
                </div>
            </motion.div>

            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#050505] to-transparent z-10" />

            {/* Victory overlay */}
            <AnimatePresence>
                {victory && (
                    <VictoryScreen
                        timeMs={victory}
                        onClose={() => setVictory(null)}
                    />
                )}
            </AnimatePresence>

            {/* Game Over — inline display */}
            <AnimatePresence>
                {showGameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="absolute bottom-28 left-0 z-[200] px-6 w-full pointer-events-auto"
                        style={{ cursor: "default" }}
                    >
                        <div className="container mx-auto max-w-5xl">
                            <div className="flex items-center gap-4 flex-wrap">
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                    className="text-2xl md:text-3xl font-black uppercase tracking-tight font-['Geist_Mono']"
                                    style={{
                                        color: "rgba(239, 68, 68, 0.9)",
                                        textShadow: "0 0 20px rgba(239,68,68,0.4)",
                                    }}
                                >
                                    ⚠ GAME OVER
                                </motion.span>

                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 border border-red-500/40 text-red-400 font-bold rounded-full text-xs uppercase cursor-pointer hover:bg-red-500/10 transition-all duration-300 font-['Geist_Mono'] tracking-wider"
                                >
                                    ↻ Restart
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowGameOver(false);
                                        setVictory(0);
                                    }}
                                    className="px-6 py-2 border border-emerald-500/40 text-emerald-400 font-bold rounded-full text-xs uppercase cursor-pointer hover:bg-emerald-500/10 transition-all duration-300 font-['Geist_Mono'] tracking-wider"
                                >
                                    ◆ Leaderboard
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Hero;
