import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLeaderboard, formatTime } from "../services/leaderboard";

const GameOverScreen = ({ onRestart, onLeaderboard }) => {
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [board, setBoard] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showLeaderboard) {
            loadLeaderboard();
        }
    }, [showLeaderboard]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await getLeaderboard(10);
            setBoard(data);
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaderboardClick = () => {
        setShowLeaderboard(true);
        onLeaderboard();
    };

    const handleBack = () => {
        setShowLeaderboard(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex flex-col items-center justify-center cursor-default"
            style={{
                zIndex: 9999,
                background: "radial-gradient(ellipse at center, rgba(26, 101, 83, 0.1) 0%, rgba(5, 5, 5, 0.92) 70%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <AnimatePresence mode="wait">
                {!showLeaderboard ? (
                    <motion.div
                        key="gameover"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="text-center"
                    >
                        <motion.h2
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-5xl md:text-7xl font-black uppercase tracking-tight"
                            style={{
                                fontFamily: "'Geist Mono', monospace",
                                color: "rgba(45, 200, 150, 0.9)",
                                textShadow: "0 0 40px rgba(45, 200, 150, 0.5), 0 0 80px rgba(45, 200, 150, 0.2)",
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
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(45, 200, 150, 0.4)" }}
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
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(45, 200, 150, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLeaderboardClick}
                                className="px-10 py-4 border border-teal-500/50 text-teal-400 font-bold rounded-full text-sm uppercase cursor-pointer hover:bg-teal-500/10 transition-all duration-300"
                                style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: "0.15em" }}
                            >
                                🏆 Leaderboard
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="leaderboard"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-full max-w-md mx-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handleBack}
                                className="text-white/30 text-xs uppercase hover:text-white/60 transition-colors"
                                style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: "0.15em" }}
                            >
                                ← Back
                            </button>
                            <h2 className="text-xl font-bold uppercase text-white" style={{ fontFamily: "'Geist Mono', monospace" }}>
                                Leaderboard
                            </h2>
                            <div className="w-12" />
                        </div>

                        <p className="text-white/20 text-xs text-center mb-6" style={{ fontFamily: "'Geist Mono', monospace" }}>
                            FASTEST BOSS KILL
                        </p>

                        <div className="space-y-2 max-h-80 overflow-y-auto px-2">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                                </div>
                            ) : board.length > 0 ? (
                                board.map((entry, i) => (
                                    <motion.div
                                        key={entry.id || i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center justify-between px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span
                                                className="font-mono text-sm font-bold w-6"
                                                style={{
                                                    color: i === 0 ? "#facc15" : i === 1 ? "#d4d4d8" : i === 2 ? "#b45309" : "rgba(255,255,255,0.2)"
                                                }}
                                            >
                                                {entry.rank || i + 1}.
                                            </span>
                                            <span className="font-mono text-white text-sm font-bold uppercase">
                                                {entry.player_name}
                                            </span>
                                        </div>
                                        <span className="font-mono text-sm text-white/50">
                                            {formatTime(entry.time_ms)}
                                        </span>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-center text-white/20 text-sm py-8 font-mono">
                                    No entries yet. Be the first!
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GameOverScreen;
