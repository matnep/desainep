import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getLeaderboard,
    submitScore,
    formatTime,
    getPlayerRank,
    getCurrentPlayerId,
    getCurrentPlayerName,
    setCurrentPlayerName,
} from "../services/leaderboard";

const VictoryScreen = ({ timeMs, onClose, analytics }) => {
    const [phase, setPhase] = useState(timeMs === 0 ? "leaderboard" : "victory");
    const [name, setName] = useState("");
    const [board, setBoard] = useState([]);
    const [playerRank, setPlayerRank] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPlayerId, setCurrentPlayerId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const savedName = getCurrentPlayerName();
        setName(savedName);
        setCurrentPlayerId(getCurrentPlayerId());
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await getLeaderboard(10);
            setBoard(data);
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

    const submitRun = async (playerName) => {
        await submitScore(playerName, timeMs, { analytics });
        setCurrentPlayerName(playerName);
        setCurrentPlayerId(getCurrentPlayerId());
        await loadLeaderboard();
        setPhase("leaderboard");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await submitRun(name.trim().toUpperCase());
        } catch (err) {
            console.error("Failed to submit score:", err);
            setError(err?.message || "Failed to submit score.");
        } finally {
            setLoading(false);
        }
    };

    const handleVictoryContinue = async () => {
        const savedName = getCurrentPlayerName();
        if (!savedName) {
            setPhase("input");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await submitRun(savedName);
        } catch (err) {
            console.error("Failed to submit score:", err);
            setError(err?.message || "Failed to submit score.");
            setPhase("input");
        } finally {
            setLoading(false);
        }
    };

    const accuracyPct = analytics ? Math.round((analytics.accuracy || 0) * 100) : 0;

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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-emerald-400 font-geist-mono text-sm uppercase tracking-[0.4em] mb-2"
                            >
                                — Congrats! —
                            </motion.div>

                            <h2 className="text-4xl md:text-5xl font-black font-geist text-white uppercase mb-6">
                                Boss Defeated!
                            </h2>

                            <p className="text-white/40 text-sm font-geist-mono mb-1">COMPLETION TIME</p>
                            <p className="text-5xl font-black font-geist-mono text-emerald-400 mb-8">
                                {formatTime(timeMs)}
                            </p>

                            {analytics && (
                                <div className="mb-8 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left">
                                    <p className="text-white/25 text-[10px] uppercase tracking-[0.25em] font-geist-mono mb-3">
                                        Run Analytics
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-geist-mono">
                                        <p className="text-white/40">Shots</p>
                                        <p className="text-white/80 text-right">{analytics.shotsFired || 0}</p>
                                        <p className="text-white/40">Accuracy</p>
                                        <p className="text-white/80 text-right">{accuracyPct}%</p>
                                        <p className="text-white/40">Asteroids</p>
                                        <p className="text-white/80 text-right">{analytics.asteroidsDestroyed || 0}</p>
                                        <p className="text-white/40">Damage Taken</p>
                                        <p className="text-white/80 text-right">{analytics.damageTaken || 0}</p>
                                    </div>
                                </div>
                            )}

                            {playerRank && (
                                <p className="text-white/30 text-sm font-geist-mono mb-6">
                                    Your rank: #{playerRank}
                                </p>
                            )}

                            {error && (
                                <p className="text-red-400 text-xs font-geist-mono text-center mb-4">
                                    {error}
                                </p>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleVictoryContinue}
                                disabled={loading}
                                className="px-8 py-4 bg-white text-black font-bold font-geist rounded-full text-sm uppercase tracking-wider cursor-pointer hover:bg-emerald-400 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : getCurrentPlayerName() ? "Submit Score" : "Enter Name"}
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

                                {analytics && (
                                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left">
                                        <p className="text-white/25 text-[10px] uppercase tracking-[0.25em] font-geist-mono mb-3">
                                            Run Analytics
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-xs font-geist-mono">
                                            <p className="text-white/40">Shots</p>
                                            <p className="text-white/80 text-right">{analytics.shotsFired || 0}</p>
                                            <p className="text-white/40">Hits</p>
                                            <p className="text-white/80 text-right">{analytics.totalHits || 0}</p>
                                            <p className="text-white/40">Accuracy</p>
                                            <p className="text-white/80 text-right">{accuracyPct}%</p>
                                            <p className="text-white/40">Boss Hits</p>
                                            <p className="text-white/80 text-right">{analytics.bossHits || 0}</p>
                                            <p className="text-white/40">Asteroids</p>
                                            <p className="text-white/80 text-right">{analytics.asteroidsDestroyed || 0}</p>
                                            <p className="text-white/40">Deaths</p>
                                            <p className="text-white/80 text-right">{analytics.deaths || 0}</p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <p className="text-red-400 text-xs font-geist-mono text-center">
                                        {error}
                                    </p>
                                )}

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
                                    const isMe = entry.player_id
                                        ? entry.player_id === currentPlayerId
                                        : entry.player_name === name.trim().toUpperCase();
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
