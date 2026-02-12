import React from "react";
import { motion } from "framer-motion";

const GameOverScreen = ({ onRestart, onLeaderboard }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex flex-col items-center justify-center cursor-default"
            style={{
                zIndex: 9999,
                background: "radial-gradient(ellipse at center, rgba(239,68,68,0.1) 0%, rgba(5,5,5,0.92) 70%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="text-center"
            >
                <motion.h2
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-5xl md:text-7xl font-black uppercase tracking-tight"
                    style={{
                        fontFamily: "'Geist Mono', monospace",
                        color: "rgba(239, 68, 68, 0.9)",
                        textShadow: "0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)",
                    }}
                >
                    ⚠ GAME OVER ⚠
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/30 text-sm mt-4 uppercase"
                    style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: "0.3em" }}
                >
                    All lives lost
                </motion.p>

                <div className="flex flex-col items-center gap-3 mt-8">
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(239,68,68,0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRestart}
                        className="px-10 py-4 border border-red-500/50 text-red-400 font-bold rounded-full text-sm uppercase cursor-pointer hover:bg-red-500/10 transition-all duration-300"
                        style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: "0.15em" }}
                    >
                        ↻ Restart
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLeaderboard}
                        className="px-10 py-3 text-white/30 rounded-full text-xs uppercase cursor-pointer hover:text-white/60 transition-all duration-300"
                        style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: "0.15em" }}
                    >
                        ☆ Leaderboard
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default GameOverScreen;
