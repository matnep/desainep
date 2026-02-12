import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLeaderboard, submitScore, formatTime, getPlayerRank } from "../services/leaderboard";

const VictoryScreen = ({ timeMs, onClose }) => {
    // If timeMs is 0 (triggered by View_Scores), start at leaderboard phase
    const [phase, setPhase] = useState(timeMs === 0 ? "leaderboard" : "victory");
    const [name, setName] = useState("");
    const [board, setBoard] = useState([]);
    const [playerRank, setPlayerRank] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await getLeaderboard(10);
            setBoard(data);
            // Only fetch rank if there is a valid time
            if (timeMs > 0) {
                const rank = await getPlayerRank(timeMs);
                setPlayerRank(rank);
            }
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await submitScore(name.trim().toUpperCase(), timeMs);
            await loadLeaderboard();
            setPhase("leaderboard");
        } catch (err) {
            console.error("Failed to submit score:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(5, 5, 5, 0.92)", backdropFilter: "blur(12px)" }}
        >
            <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-md mx-4"
            >
                <AnimatePresence mode="wait">
                    {phase === "victory" && (
                        <motion.div
                            key="victory"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                className="text-7xl mb-6"
                            >
                                🏆
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black font-geist text-white uppercase mb-3">
                                Boss Defeated!
                            </h2>
                            <p className="text-white/40 text-sm font-geist-mono mb-1">
                                COMPLETION TIME
                            </p>
                            <p className="text-5xl font-black font-geist-mono text-emerald-400 mb-8">
                                {formatTime(timeMs)}
                            </p>
                            {playerRank && (
                                <p className="text-white/30 text-sm font-geist-mono mb-6">
                                    Your rank: #{playerRank}
                                </p>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setPhase("input")}
                                className="px-8 py-4 bg-white text-black font-bold font-geist rounded-full text-sm uppercase tracking-wider cursor-pointer hover:bg-emerald-400 transition-colors"
                            >
                                Enter Your Name →
                            </motion.button>
                        </motion.div>
                    )}

                    {phase === "input" && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-bold font-geist text-white mb-6 uppercase">
                                Leaderboard Entry
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    maxLength={12}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="YOUR NAME"
                                    autoFocus
                                    disabled={loading}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-xl font-geist-mono uppercase tracking-wider placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                                />
                                <div className="flex items-center justify-center gap-2 text-white/20 font-geist-mono text-sm">
                                    <span>Time:</span>
                                    <span className="text-emerald-400 font-bold">{formatTime(timeMs)}</span>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={loading || !name.trim()}
                                        className="w-full px-8 py-4 bg-white text-black font-bold font-geist rounded-full text-sm uppercase tracking-wider cursor-pointer hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Submitting..." : "Submit"}
                                    </motion.button>

                                    <button
                                        type="button"
                                        onClick={() => setPhase("leaderboard")}
                                        className="w-full py-2 text-white/20 hover:text-white/50 text-[10px] font-geist-mono uppercase tracking-[0.3em] transition-colors"
                                    >
                                        [ Skip ]
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {phase === "leaderboard" && (
                        <motion.div
                            key="leaderboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-2xl font-bold font-geist text-white mb-2 uppercase text-center">
                                Leaderboard
                            </h2>
                            <p className="text-white/20 text-xs font-geist-mono text-center mb-6">
                                FASTEST BOSS KILL
                            </p>
                            <div className="space-y-2 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {board.map((entry, i) => {
                                    const isMe = entry.player_name === name.trim().toUpperCase() && entry.time_ms === timeMs;
                                    return (
                                        <motion.div
                                            key={entry.id || i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex items-center justify-between px-5 py-3 rounded-xl ${isMe
                                                ? "bg-emerald-400/10 border border-emerald-400/20"
                                                : "bg-white/[0.03] border border-white/5"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`font-geist-mono text-sm font-bold w-6 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-white/20"
                                                    }`}>
                                                    {entry.rank || i + 1}.
                                                </span>
                                                <span className="font-geist-mono text-white text-sm font-bold uppercase">
                                                    {entry.player_name}
                                                </span>
                                            </div>
                                            <span className={`font-geist-mono text-sm ${isMe ? "text-emerald-400" : "text-white/50"}`}>
                                                {formatTime(entry.time_ms)}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                                {board.length === 0 && !loading && (
                                    <p className="text-center text-white/20 text-sm font-geist py-4">
                                        No entries yet. Be the first!
                                    </p>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="w-full px-8 py-4 bg-white text-black font-bold font-geist rounded-full text-sm uppercase tracking-wider cursor-pointer hover:bg-emerald-400 transition-colors"
                            >
                                Continue
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default VictoryScreen;