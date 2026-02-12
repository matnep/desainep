import React, { useEffect, useRef, useCallback, useState } from "react";
import { getLeaderboard, formatTime } from "../services/leaderboard";

const generateShape = (radius, points) => {
    const verts = [];
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        verts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
    return verts;
};

const BOSS_THRESHOLD = 10;
const BOSS_HP = 25;
const PLAYER_LIVES = 3;

// --- Procedural Sound Effects (Web Audio API) ---
let audioCtx = null;
const getAudioCtx = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
};

const playLaserSound = () => {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    } catch (e) { }
};

const playExplosionSound = (size) => {
    try {
        const ctx = getAudioCtx();
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600 + size * 200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.08 * Math.min(size, 2), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        source.start(ctx.currentTime);
    } catch (e) { }
};

const playBossHitSound = () => {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
    } catch (e) { }
};

const RocketGame = ({ textContainerRef, onBossDefeated, onGameOver }) => {
    const canvasRef = useRef(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const state = useRef({
        mouse: { x: 0, y: 0 },
        rocket: { x: 0, y: 0, angle: -Math.PI / 2 },
        lasers: [],
        particles: [],
        asteroids: [],
        spawnTimer: 0,
        score: 0,
        lives: PLAYER_LIVES,
        invincible: 0,
        dead: false,
        respawnTimer: 0,
        boss: null,
        bossWarning: 0,
        bossDefeated: false,
        bossProjectiles: [],
        gamePhase: "normal",
        screenShake: { x: 0, y: 0, intensity: 0 },
        gameOver: false,
        // Timer
        startTime: Date.now(),
        elapsedMs: 0,
    });

    const loadLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            const data = await getLeaderboard(10);
            setLeaderboard(data);
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const shootLaser = useCallback(() => {
        const s = state.current;
        if (s.dead || s.gameOver) return;
        const speed = 16;
        const noseX = s.rocket.x + Math.cos(s.rocket.angle) * 18;
        const noseY = s.rocket.y + Math.sin(s.rocket.angle) * 18;
        s.lasers.push({
            x: noseX, y: noseY,
            vx: Math.cos(s.rocket.angle) * speed,
            vy: Math.sin(s.rocket.angle) * speed,
            life: 60,
        });
        playLaserSound();
        for (let p = 0; p < 5; p++) {
            const spread = (Math.random() - 0.5) * 0.8;
            const spd = 2 + Math.random() * 3;
            s.particles.push({
                x: noseX, y: noseY,
                vx: Math.cos(s.rocket.angle + spread) * spd,
                vy: Math.sin(s.rocket.angle + spread) * spd,
                life: 10 + Math.random() * 10, maxLife: 20,
                size: 1 + Math.random() * 2, color: "white",
            });
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animId;

        const resize = () => {
            const parent = canvas.parentElement;
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
        };

        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            state.current.mouse.x = e.clientX - rect.left;
            state.current.mouse.y = e.clientY - rect.top;
        };

        const onClick = () => shootLaser();

        const spawnAsteroid = (w, h) => {
            const s = state.current;
            if (s.gamePhase === "boss") return;
            const edge = Math.floor(Math.random() * 4);
            let x, y, vx, vy;
            const speed = 0.5 + Math.random() * 1.5;
            if (edge === 0) { x = Math.random() * w; y = -40; vx = (Math.random() - 0.5) * 2; vy = speed; }
            else if (edge === 1) { x = w + 40; y = Math.random() * h; vx = -speed; vy = (Math.random() - 0.5) * 2; }
            else if (edge === 2) { x = Math.random() * w; y = h + 40; vx = (Math.random() - 0.5) * 2; vy = -speed; }
            else { x = -40; y = Math.random() * h; vx = speed; vy = (Math.random() - 0.5) * 2; }
            const radius = 15 + Math.random() * 25;
            s.asteroids.push({
                x, y, vx, vy, radius,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.03,
                shape: generateShape(radius, 5 + Math.floor(Math.random() * 4)),
                hp: radius > 28 ? 3 : radius > 20 ? 2 : 1,
                maxHp: radius > 28 ? 3 : radius > 20 ? 2 : 1,
                crackSeed: Math.floor(Math.random() * 4),
            });
        };

        const spawnExplosion = (x, y, count, scale) => {
            const s = state.current;
            const colors = ["#ef4444", "#f97316", "#fbbf24", "white", "#a78bfa", "#34d399"];
            for (let p = 0; p < count; p++) {
                const angle = (p / count) * Math.PI * 2 + Math.random() * 0.5;
                const spd = 1 + Math.random() * 7 * scale;
                s.particles.push({
                    x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                    life: 25 + Math.random() * 35, maxLife: 60,
                    size: (1 + Math.random() * 5) * scale,
                    color: colors[Math.floor(Math.random() * colors.length)],
                });
            }
            for (let c = 0; c < Math.floor(6 * scale); c++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 1 + Math.random() * 3;
                s.particles.push({
                    x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1,
                    life: 40 + Math.random() * 30, maxLife: 70, size: 3 + Math.random() * 5,
                    color: "rock", rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.15,
                });
            }
        };

        const explodeAsteroid = (ast, idx) => {
            const s = state.current;
            spawnExplosion(ast.x, ast.y, 20 + Math.floor(ast.radius), 1);
            playExplosionSound(ast.radius / 15);
            if (ast.radius > 20) {
                for (let k = 0; k < 2; k++) {
                    const angle = Math.random() * Math.PI * 2;
                    const newR = ast.radius * 0.45;
                    s.asteroids.push({
                        x: ast.x + Math.cos(angle) * 10, y: ast.y + Math.sin(angle) * 10,
                        vx: Math.cos(angle) * 1.5 + ast.vx * 0.5, vy: Math.sin(angle) * 1.5 + ast.vy * 0.5,
                        radius: newR, rotation: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.05,
                        shape: generateShape(newR, 4 + Math.floor(Math.random() * 3)),
                        hp: 1, maxHp: 1,
                        crackSeed: Math.floor(Math.random() * 4),
                    });
                }
            }
            s.asteroids.splice(idx, 1);
            s.score++;
            if (s.score >= BOSS_THRESHOLD && !s.boss && !s.bossDefeated && s.gamePhase === "normal") {
                s.gamePhase = "warning";
                s.bossWarning = 180;
            }
        };

        const destroyRocket = () => {
            const s = state.current;
            if (s.invincible > 0 || s.dead) return;
            spawnExplosion(s.rocket.x, s.rocket.y, 30, 1.5);
            playExplosionSound(2);
            s.screenShake.intensity = 15;
            s.lives--;
            s.dead = true;
            if (s.lives <= 0) {
                s.gameOver = true;
                if (onGameOver) onGameOver(s.score);
            } else {
                s.respawnTimer = 90;
            }
        };

        const spawnBoss = () => {
            const s = state.current;
            // Keep existing asteroids alive!
            s.boss = {
                x: canvas.width / 2, y: -80,
                targetY: canvas.height * 0.22,
                hp: BOSS_HP, maxHp: BOSS_HP,
                phase: "enter", moveT: 0,
                shootTimer: 0, bobT: 0, lightT: 0,
                bossPhase: 1, // 1, 2, 3
                phaseFlash: 0,
                asteroidTimer: 0,
            };
            s.gamePhase = "boss";
        };

        const drawUFO = (b) => {
            ctx.save();
            ctx.translate(b.x, b.y);
            const tilt = Math.sin(b.moveT) * 0.08;
            ctx.rotate(tilt);
            const dmgRatio = b.hp / b.maxHp;
            const bob = Math.sin(b.bobT) * 4;
            ctx.translate(0, bob);

            // Tractor beam
            const beamAlpha = 0.03 + Math.sin(b.lightT * 2) * 0.02;
            ctx.beginPath();
            ctx.moveTo(-15, 8); ctx.lineTo(15, 8); ctx.lineTo(40, 80); ctx.lineTo(-40, 80);
            ctx.closePath();
            const beamGrad = ctx.createLinearGradient(0, 8, 0, 80);
            beamGrad.addColorStop(0, `rgba(120,200,255,${beamAlpha * 2})`);
            beamGrad.addColorStop(1, "rgba(120,200,255,0)");
            ctx.fillStyle = beamGrad; ctx.fill();

            // Saucer disc
            ctx.beginPath();
            ctx.ellipse(0, 4, 50, 12, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.08 + dmgRatio * 0.08})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255,${0.2 + dmgRatio * 0.15})`;
            ctx.lineWidth = 1.5; ctx.stroke();

            // Underside rim
            ctx.beginPath();
            ctx.ellipse(0, 8, 48, 8, 0, 0, Math.PI);
            ctx.strokeStyle = `rgba(120,200,255,${0.15 + Math.sin(b.lightT * 3) * 0.1})`;
            ctx.lineWidth = 1; ctx.stroke();

            // Glass dome
            ctx.beginPath();
            ctx.ellipse(0, -2, 22, 18, 0, Math.PI, 0);
            ctx.fillStyle = `rgba(255,255,255,${0.04 + dmgRatio * 0.04})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255,${0.15 + dmgRatio * 0.15})`;
            ctx.lineWidth = 1; ctx.stroke();

            // Dome highlight
            ctx.beginPath();
            ctx.ellipse(-6, -10, 8, 5, -0.2, Math.PI, 0);
            ctx.strokeStyle = "rgba(255,255,255,0.08)";
            ctx.lineWidth = 1; ctx.stroke();

            // Rotating rim lights
            for (let i = 0; i < 8; i++) {
                const la = (i / 8) * Math.PI * 2 + b.lightT;
                const lx = Math.cos(la) * 42;
                const ly = Math.sin(la) * 6 + 4;
                const isActive = Math.sin(la + b.lightT * 2) > 0.3;
                ctx.beginPath();
                ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = isActive
                    ? `rgba(120,200,255,${0.6 + Math.sin(b.lightT * 4) * 0.3})`
                    : "rgba(255,255,255,0.05)";
                ctx.fill();
            }

            // Damage cracks + smoke
            if (dmgRatio < 1) {
                const crackCount = Math.floor((1 - dmgRatio) * 6);
                ctx.strokeStyle = `rgba(239,68,68,${(1 - dmgRatio) * 0.6})`;
                ctx.lineWidth = 1.5;
                for (let c = 0; c < crackCount; c++) {
                    const ca = (c / crackCount) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(ca) * 10, Math.sin(ca) * 5);
                    ctx.lineTo(Math.cos(ca) * 40, Math.sin(ca) * 10 + 4);
                    ctx.stroke();
                }
                if (Math.random() < (1 - dmgRatio) * 0.3) {
                    state.current.particles.push({
                        x: b.x + (Math.random() - 0.5) * 60,
                        y: b.y + (Math.random() - 0.5) * 15,
                        vx: (Math.random() - 0.5) * 0.5, vy: -0.5 - Math.random(),
                        life: 20 + Math.random() * 20, maxLife: 40,
                        size: 3 + Math.random() * 4, color: "smoke",
                    });
                }
            }
            ctx.restore();
        };

        const checkTextCollision = (lx, ly) => {
            if (!textContainerRef?.current) return false;
            const chars = textContainerRef.current.querySelectorAll(".hero-char");
            const canvasRect = canvas.getBoundingClientRect();
            for (const ch of chars) {
                if (ch.dataset.hit === "1") continue;
                const r = ch.getBoundingClientRect();
                const cx = r.left - canvasRect.left + r.width / 2;
                const cy = r.top - canvasRect.top + r.height / 2;
                const dx = lx - cx; const dy = ly - cy;
                if (Math.sqrt(dx * dx + dy * dy) < Math.max(r.width, r.height) * 0.7) {
                    ch.dataset.hit = "1";
                    // Save original animation so we can restore hover later
                    if (!ch.dataset.origAnim) ch.dataset.origAnim = ch.style.animation;
                    const throwX = (Math.random() - 0.5) * 200;
                    const throwY = -50 - Math.random() * 120;
                    const spin = (Math.random() - 0.5) * 720;
                    ch.style.animation = "none";
                    ch.style.transition = "none";
                    ch.style.display = "inline-block";
                    void ch.offsetWidth;
                    ch.style.transition = "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out";
                    ch.style.transform = `translate(${throwX}px, ${throwY}px) rotate(${spin}deg) scale(0)`;
                    ch.style.opacity = "0";
                    const colors = ["white", "#ef4444", "#fbbf24"];
                    for (let p = 0; p < 18; p++) {
                        const angle = (p / 18) * Math.PI * 2 + Math.random() * 0.5;
                        const spd = 2 + Math.random() * 8;
                        state.current.particles.push({
                            x: cx, y: cy,
                            vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 2,
                            life: 20 + Math.random() * 40, maxLife: 60,
                            size: 1 + Math.random() * 4,
                            color: colors[Math.floor(Math.random() * colors.length)],
                        });
                    }
                    for (let c = 0; c < 5; c++) {
                        const angle = Math.random() * Math.PI * 2;
                        const spd = 1 + Math.random() * 3;
                        state.current.particles.push({
                            x: cx, y: cy,
                            vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1,
                            life: 30 + Math.random() * 25, maxLife: 55,
                            size: 2 + Math.random() * 4,
                            color: "rock", rotation: Math.random() * Math.PI * 2,
                            rotSpeed: (Math.random() - 0.5) * 0.15,
                        });
                    }
                    const savedAnim = ch.dataset.origAnim;
                    setTimeout(() => {
                        ch.dataset.hit = "0";
                        ch.style.transition = "all 2s cubic-bezier(0.16, 1, 0.3, 1)";
                        ch.style.transform = ""; ch.style.opacity = "";
                        // Restore original hover animation
                        setTimeout(() => { ch.style.animation = savedAnim || ""; }, 2000);
                    }, 3000 + Math.random() * 2000);
                    return true;
                }
            }
            return false;
        };

        const formatTime = (ms) => {
            const totalSec = Math.floor(ms / 1000);
            const min = Math.floor(totalSec / 60);
            const sec = totalSec % 60;
            const frac = Math.floor((ms % 1000) / 100);
            return `${min}:${String(sec).padStart(2, "0")}.${frac}`;
        };

        const draw = () => {
            const s = state.current;

            // Update timer
            if (!s.gameOver && !s.bossDefeated) {
                s.elapsedMs = Date.now() - s.startTime;
            }

            // Screen shake
            if (s.screenShake.intensity > 0) {
                s.screenShake.x = (Math.random() - 0.5) * s.screenShake.intensity;
                s.screenShake.y = (Math.random() - 0.5) * s.screenShake.intensity;
                s.screenShake.intensity *= 0.92;
                if (s.screenShake.intensity < 0.5) s.screenShake.intensity = 0;
            }

            ctx.save();
            ctx.translate(s.screenShake.x, s.screenShake.y);
            ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);

            // Respawn
            if (s.dead && s.lives > 0) {
                s.respawnTimer--;
                if (s.respawnTimer <= 0) {
                    s.dead = false;
                    s.invincible = 120;
                    s.rocket.x = canvas.width / 2;
                    s.rocket.y = canvas.height * 0.7;
                }
            }
            if (s.invincible > 0) s.invincible--;

            // Spawn asteroids (continue during boss fight too)
            if (!s.gameOver) {
                s.spawnTimer++;
                const spawnRate = s.gamePhase === "boss" ? 150 : 90; // slower during boss
                if (s.spawnTimer > spawnRate) { spawnAsteroid(canvas.width, canvas.height); s.spawnTimer = 0; }
            }

            // Warning
            if (s.gamePhase === "warning") {
                s.bossWarning--;
                if (Math.floor(s.bossWarning / 15) % 2 === 0) {
                    ctx.save();
                    ctx.font = "bold 24px 'Geist Mono', monospace";
                    ctx.fillStyle = `rgba(239,68,68,${0.5 + Math.sin(s.bossWarning * 0.2) * 0.3})`;
                    ctx.textAlign = "center";
                    ctx.fillText("⚠ WARNING ⚠", canvas.width / 2, 50);
                    ctx.restore();
                }
                if (s.bossWarning <= 0) spawnBoss();
            }

            // Lerp rocket
            if (!s.dead && !s.gameOver) {
                s.rocket.x += (s.mouse.x - s.rocket.x) * 0.12;
                s.rocket.y += (s.mouse.y - s.rocket.y) * 0.12;
                const rdx = s.mouse.x - s.rocket.x;
                const rdy = s.mouse.y - s.rocket.y;
                const ta = Math.atan2(rdy, rdx);
                let diff = ta - s.rocket.angle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                s.rocket.angle += diff * 0.12;
            }

            // --- Asteroids ---
            for (let i = s.asteroids.length - 1; i >= 0; i--) {
                const a = s.asteroids[i];
                a.x += a.vx; a.y += a.vy; a.rotation += a.rotSpeed;
                if (a.x < -100 || a.x > canvas.width + 100 || a.y < -100 || a.y > canvas.height + 100) {
                    s.asteroids.splice(i, 1); continue;
                }
                if (!s.dead && !s.gameOver && s.invincible <= 0) {
                    const dx = a.x - s.rocket.x; const dy = a.y - s.rocket.y;
                    if (Math.sqrt(dx * dx + dy * dy) < a.radius + 12) destroyRocket();
                }
                ctx.save();
                ctx.translate(a.x, a.y); ctx.rotate(a.rotation);
                const dmg = a.hp / a.maxHp;
                ctx.beginPath();
                ctx.moveTo(a.shape[0].x, a.shape[0].y);
                for (let v = 1; v < a.shape.length; v++) ctx.lineTo(a.shape[v].x, a.shape[v].y);
                ctx.closePath();
                ctx.fillStyle = `rgba(255,255,255,${0.05 + dmg * 0.08})`;
                ctx.fill();
                ctx.strokeStyle = `rgba(255,255,255,${0.15 + dmg * 0.2})`;
                ctx.lineWidth = 1.5; ctx.stroke();
                if (dmg < 1) {
                    const intensity = 1 - dmg;
                    const crackAlpha = intensity * 0.6;
                    ctx.strokeStyle = `rgba(255,255,255,${crackAlpha})`;
                    ctx.lineWidth = 1;
                    // Use asteroid's crackSeed to pick a pattern
                    const pattern = (a.crackSeed || 0) % 4;
                    const crackCount = 2 + Math.floor(intensity * 5);

                    if (pattern === 0) {
                        // Symmetrical radial lines from center to edge vertices
                        for (let c = 0; c < crackCount; c++) {
                            const angle = (c / crackCount) * Math.PI * 2;
                            const len = a.radius * (0.4 + intensity * 0.5);
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
                            ctx.stroke();
                        }
                    } else if (pattern === 1) {
                        // Concentric polygons matching asteroid shape
                        const ringCount = Math.ceil(intensity * 3);
                        const sides = a.shape.length;
                        for (let ring = 1; ring <= ringCount; ring++) {
                            const r = a.radius * (ring / (ringCount + 1));
                            ctx.beginPath();
                            for (let v = 0; v < sides; v++) {
                                const angle = (v / sides) * Math.PI * 2;
                                const px = Math.cos(angle) * r;
                                const py = Math.sin(angle) * r;
                                v === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                            }
                            ctx.closePath();
                            ctx.stroke();
                        }
                    } else if (pattern === 2) {
                        // Symmetrical star: radials + inner polygon
                        const arms = crackCount + 2;
                        for (let c = 0; c < arms; c++) {
                            const angle = (c / arms) * Math.PI * 2;
                            const len = a.radius * (0.5 + intensity * 0.4);
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
                            ctx.stroke();
                        }
                        // Inner connecting polygon
                        if (intensity > 0.3) {
                            const ir = a.radius * 0.35;
                            ctx.beginPath();
                            for (let c = 0; c < arms; c++) {
                                const angle = (c / arms) * Math.PI * 2;
                                const px = Math.cos(angle) * ir;
                                const py = Math.sin(angle) * ir;
                                c === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                            }
                            ctx.closePath();
                            ctx.stroke();
                        }
                    } else {
                        // Symmetrical web: radials + concentric ring
                        const spokes = crackCount + 1;
                        const len = a.radius * (0.5 + intensity * 0.4);
                        for (let c = 0; c < spokes; c++) {
                            const angle = (c / spokes) * Math.PI * 2;
                            ctx.beginPath();
                            ctx.moveTo(Math.cos(angle) * a.radius * 0.15, Math.sin(angle) * a.radius * 0.15);
                            ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
                            ctx.stroke();
                        }
                        // Connecting polygon at midpoint
                        if (intensity > 0.4) {
                            const mr = a.radius * 0.4;
                            ctx.beginPath();
                            for (let c = 0; c < spokes; c++) {
                                const angle = (c / spokes) * Math.PI * 2;
                                const px = Math.cos(angle) * mr;
                                const py = Math.sin(angle) * mr;
                                c === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                            }
                            ctx.closePath();
                            ctx.stroke();
                        }
                    }
                }
                ctx.restore();
            }

            // --- Boss UFO ---
            if (s.boss) {
                const b = s.boss;

                // Determine boss phase based on HP
                const hpRatio = b.hp / b.maxHp;
                const newPhase = hpRatio > 0.6 ? 1 : hpRatio > 0.3 ? 2 : 3;
                if (newPhase !== b.bossPhase) {
                    b.bossPhase = newPhase;
                    b.phaseFlash = 60; // flash for 1 second on phase change
                    s.screenShake.intensity = 12;
                }
                if (b.phaseFlash > 0) b.phaseFlash--;

                if (b.phase === "enter") {
                    b.y += (b.targetY - b.y) * 0.02;
                    if (Math.abs(b.y - b.targetY) < 2) b.phase = "fight";
                } else {
                    // Movement varies by phase
                    if (b.bossPhase === 1) {
                        // Phase 1: Slow, wide sine wave
                        b.moveT += 0.006;
                        b.x = canvas.width / 2 + Math.sin(b.moveT) * (canvas.width * 0.25);
                        b.y = b.targetY + Math.sin(b.moveT * 1.5) * 30;
                    } else if (b.bossPhase === 2) {
                        // Phase 2: Faster figure-8 pattern
                        b.moveT += 0.012;
                        b.x = canvas.width / 2 + Math.sin(b.moveT) * (canvas.width * 0.3);
                        b.y = b.targetY + Math.sin(b.moveT * 2) * 50;
                    } else {
                        // Phase 3: Erratic zigzag, fast and unpredictable
                        b.moveT += 0.02;
                        b.x = canvas.width / 2 + Math.sin(b.moveT) * (canvas.width * 0.35) + Math.sin(b.moveT * 3.7) * 40;
                        b.y = b.targetY + Math.sin(b.moveT * 2.3) * 60 + Math.cos(b.moveT * 4.1) * 20;
                    }
                }
                b.bobT += 0.05; b.lightT += 0.03;

                // Boss shoots — behavior per phase
                if (b.phase === "fight" && !s.dead && !s.gameOver) {
                    b.shootTimer++;
                    let interval, shotCount, bSpeed, spreadAngle;

                    if (b.bossPhase === 1) {
                        // Phase 1: Single aimed shots, slow fire rate
                        interval = 90; shotCount = 1; bSpeed = 3.5; spreadAngle = 0;
                    } else if (b.bossPhase === 2) {
                        // Phase 2: Double shots, moderate fire rate
                        interval = 60; shotCount = 2; bSpeed = 4.5; spreadAngle = 0.12;
                    } else {
                        // Phase 3: Triple spread, fast fire rate, faster projectiles
                        interval = 40; shotCount = 3; bSpeed = 5.5; spreadAngle = 0.18;
                    }

                    if (b.shootTimer >= interval) {
                        b.shootTimer = 0;
                        const dx = s.rocket.x - b.x; const dy = s.rocket.y - b.y;
                        for (let sh = 0; sh < shotCount; sh++) {
                            const offset = shotCount > 1 ? (sh - (shotCount - 1) / 2) * spreadAngle : 0;
                            const angle = Math.atan2(dy, dx) + offset;
                            s.bossProjectiles.push({
                                x: b.x, y: b.y + 12,
                                vx: Math.cos(angle) * bSpeed, vy: Math.sin(angle) * bSpeed,
                                life: 180,
                            });
                        }
                        for (let p = 0; p < 4; p++) {
                            s.particles.push({
                                x: b.x, y: b.y + 12,
                                vx: (Math.random() - 0.5) * 3, vy: 1 + Math.random() * 2,
                                life: 8 + Math.random() * 8, maxLife: 16,
                                size: 1 + Math.random() * 2, color: "#ef4444",
                            });
                        }
                    }

                    // Phase 2+: Boss spawns mini asteroids occasionally
                    if (b.bossPhase >= 2) {
                        b.asteroidTimer++;
                        const asteroidInterval = b.bossPhase === 3 ? 120 : 200;
                        if (b.asteroidTimer >= asteroidInterval) {
                            b.asteroidTimer = 0;
                            const angle = Math.random() * Math.PI * 2;
                            const spd = 1.5 + Math.random() * 1.5;
                            const newR = 12 + Math.random() * 8;
                            s.asteroids.push({
                                x: b.x, y: b.y + 15,
                                vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd + 1,
                                radius: newR, rotation: Math.random() * Math.PI * 2,
                                rotSpeed: (Math.random() - 0.5) * 0.04,
                                shape: generateShape(newR, 6 + Math.floor(Math.random() * 3)),
                                hp: 1, maxHp: 1,
                                crackSeed: Math.floor(Math.random() * 4),
                            });
                        }
                    }
                }

                drawUFO(b);

                // Phase transition flash
                if (b.phaseFlash > 0 && Math.floor(b.phaseFlash / 8) % 2 === 0) {
                    ctx.fillStyle = `rgba(239, 68, 68, ${b.phaseFlash / 60 * 0.08})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Health bar (top of screen)
                const barW = 200, barH = 4;
                const barX = (canvas.width - barW) / 2;
                const barY = 16;
                ctx.fillStyle = "rgba(255,255,255,0.08)";
                ctx.fillRect(barX, barY, barW, barH);
                const hpFrac = Math.max(0, b.hp / b.maxHp);
                ctx.fillStyle = hpFrac > 0.5 ? "rgba(52,211,153,0.8)" : hpFrac > 0.25 ? "rgba(251,191,36,0.8)" : "rgba(239,68,68,0.8)";
                ctx.fillRect(barX, barY, barW * hpFrac, barH);
                ctx.strokeStyle = "rgba(255,255,255,0.15)";
                ctx.lineWidth = 0.5;
                ctx.strokeRect(barX, barY, barW, barH);

                // Phase indicator dots below health bar
                ctx.textAlign = "center";
                for (let p = 0; p < 3; p++) {
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2 - 10 + p * 10, barY + 12, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = p < b.bossPhase ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.1)";
                    ctx.fill();
                }
            }

            // --- UFO Body Collision ---
            if (s.boss && !s.dead && !s.gameOver && s.invincible <= 0) {
                const dx = s.rocket.x - s.boss.x;
                const dy = s.rocket.y - s.boss.y;
                // Elliptical collision: saucer is 50px wide, 12px tall
                if ((dx * dx) / (55 * 55) + (dy * dy) / (20 * 20) < 1) {
                    destroyRocket();
                }
            }

            // --- Boss Projectiles ---
            for (let i = s.bossProjectiles.length - 1; i >= 0; i--) {
                const bp = s.bossProjectiles[i];
                bp.x += bp.vx; bp.y += bp.vy; bp.life--;
                if (!s.dead && !s.gameOver && s.invincible <= 0) {
                    const dx = bp.x - s.rocket.x; const dy = bp.y - s.rocket.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 14) {
                        destroyRocket();
                        s.bossProjectiles.splice(i, 1); continue;
                    }
                }
                if (bp.life <= 0 || bp.x < -50 || bp.x > canvas.width + 50 || bp.y < -50 || bp.y > canvas.height + 50) {
                    s.bossProjectiles.splice(i, 1); continue;
                }
                ctx.save();
                ctx.beginPath();
                ctx.arc(bp.x, bp.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(239,68,68,0.8)";
                ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 12;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(bp.x, bp.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,200,200,0.9)";
                ctx.fill();
                const speed = Math.sqrt(bp.vx * bp.vx + bp.vy * bp.vy);
                const nx = bp.vx / speed; const ny = bp.vy / speed;
                ctx.beginPath();
                ctx.moveTo(bp.x, bp.y);
                ctx.lineTo(bp.x - nx * 12, bp.y - ny * 12);
                ctx.strokeStyle = "rgba(239,68,68,0.3)"; ctx.lineWidth = 3; ctx.stroke();
                ctx.restore();
            }

            // --- Rocket ---
            if (!s.dead && !s.gameOver) {
                const rx = s.rocket.x, ry = s.rocket.y, ra = s.rocket.angle;
                const blink = s.invincible > 0 && Math.floor(s.invincible / 4) % 2 === 0;
                if (!blink) {
                    ctx.save();
                    ctx.translate(rx, ry); ctx.rotate(ra);
                    ctx.globalAlpha = s.invincible > 0 ? 0.5 : 1;
                    const flicker = 0.6 + Math.random() * 0.4;
                    const fl = 18 * flicker;
                    ctx.beginPath();
                    ctx.moveTo(-16, -5);
                    ctx.quadraticCurveTo(-16 - fl * 0.6, 0, -16, 5);
                    ctx.quadraticCurveTo(-16 - fl, 0, -16, -5);
                    const fg = ctx.createLinearGradient(-16, 0, -16 - fl, 0);
                    fg.addColorStop(0, "rgba(255,255,255,0.8)");
                    fg.addColorStop(0.4, "rgba(255,255,255,0.4)");
                    fg.addColorStop(1, "rgba(255,255,255,0)");
                    ctx.fillStyle = fg; ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(22, 0); ctx.lineTo(4, -8); ctx.lineTo(-16, -6); ctx.lineTo(-16, 6); ctx.lineTo(4, 8);
                    ctx.closePath(); ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(8, -7); ctx.lineTo(4, -8); ctx.lineTo(-2, -7); ctx.lineTo(-2, 7); ctx.lineTo(4, 8); ctx.lineTo(8, 7);
                    ctx.closePath(); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fill();
                    ctx.beginPath(); ctx.ellipse(12, 0, 3.5, 3, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fill();
                    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1; ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(-18, -16); ctx.lineTo(-16, -6); ctx.closePath();
                    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fill();
                    ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-18, 16); ctx.lineTo(-16, 6); ctx.closePath(); ctx.fill();
                    // --- Aiming dots ---
                    const aimLen = 100;
                    const dotCount = 8;
                    for (let d = 0; d < dotCount; d++) {
                        const t = (d + 1) / dotCount;
                        const dx = 26 + t * aimLen;
                        const alpha = 0.25 * (1 - t);
                        const radius = 1.5 * (1 - t * 0.5);
                        ctx.beginPath();
                        ctx.arc(dx, 0, radius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                        ctx.fill();
                    }

                    ctx.restore();
                }
            }

            // --- Lasers ---
            for (let i = s.lasers.length - 1; i >= 0; i--) {
                const l = s.lasers[i];
                l.x += l.vx; l.y += l.vy; l.life--;
                let hit = false;
                if (s.boss) {
                    const dx = l.x - s.boss.x; const dy = l.y - s.boss.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 50) {
                        s.boss.hp--; s.screenShake.intensity = 5;
                        playBossHitSound();
                        for (let p = 0; p < 8; p++) {
                            const angle = Math.random() * Math.PI * 2;
                            const spd = 2 + Math.random() * 5;
                            s.particles.push({
                                x: l.x, y: l.y,
                                vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                                life: 10 + Math.random() * 20, maxLife: 30,
                                size: 1 + Math.random() * 3,
                                color: ["#ef4444", "#fbbf24", "white"][Math.floor(Math.random() * 3)],
                            });
                        }
                        if (s.boss.hp <= 0) {
                            spawnExplosion(s.boss.x, s.boss.y, 80, 2.5);
                            playExplosionSound(3);
                            s.screenShake.intensity = 30;
                            s.boss = null; s.bossProjectiles = [];
                            s.bossDefeated = true; s.gamePhase = "normal";
                            if (onBossDefeated) onBossDefeated(s.elapsedMs);
                        }
                        hit = true;
                    }
                }
                if (!hit) {
                    for (let a = s.asteroids.length - 1; a >= 0; a--) {
                        const ast = s.asteroids[a];
                        const dx = l.x - ast.x; const dy = l.y - ast.y;
                        if (Math.sqrt(dx * dx + dy * dy) < ast.radius) {
                            ast.hp--;
                            for (let p = 0; p < 6; p++) {
                                const angle = Math.random() * Math.PI * 2;
                                const spd = 2 + Math.random() * 4;
                                s.particles.push({
                                    x: l.x, y: l.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                                    life: 10 + Math.random() * 15, maxLife: 25,
                                    size: 1 + Math.random() * 2, color: "#fbbf24",
                                });
                            }
                            if (ast.hp <= 0) explodeAsteroid(ast, a);
                            hit = true; break;
                        }
                    }
                }
                if (hit) { s.lasers.splice(i, 1); continue; }
                if (checkTextCollision(l.x, l.y)) { s.lasers.splice(i, 1); continue; }
                if (l.life <= 0 || l.x < -50 || l.x > canvas.width + 50 || l.y < -50 || l.y > canvas.height + 50) {
                    s.lasers.splice(i, 1); continue;
                }
                const speed = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
                const nx = l.vx / speed; const ny = l.vy / speed;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(l.x, l.y); ctx.lineTo(l.x - nx * 20, l.y - ny * 20);
                ctx.strokeStyle = "#34d399"; ctx.lineWidth = 2.5;
                ctx.shadowColor = "#34d399"; ctx.shadowBlur = 8; ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(l.x, l.y); ctx.lineTo(l.x - nx * 12, l.y - ny * 12);
                ctx.strokeStyle = "#86efac"; ctx.lineWidth = 1; ctx.stroke();
                ctx.beginPath();
                ctx.arc(l.x, l.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = "#fff"; ctx.fill();
                ctx.restore();
            }

            // --- Particles ---
            for (let i = s.particles.length - 1; i >= 0; i--) {
                const p = s.particles[i];
                p.x += p.vx; p.y += p.vy;
                p.vy += 0.08; p.vx *= 0.97; p.vy *= 0.97;
                p.life--;
                if (p.life <= 0) { s.particles.splice(i, 1); continue; }
                const alpha = p.life / p.maxLife;
                if (p.color === "rock") {
                    p.rotation = (p.rotation || 0) + (p.rotSpeed || 0);
                    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size * alpha);
                    ctx.lineTo(-p.size * alpha * 0.8, p.size * alpha * 0.6);
                    ctx.lineTo(p.size * alpha * 0.8, p.size * alpha * 0.6);
                    ctx.closePath();
                    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.4})`;
                    ctx.fill(); ctx.restore(); continue;
                }
                if (p.color === "smoke") {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(100,100,100,${alpha * 0.3})`;
                    ctx.fill(); continue;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                if (p.color === "#ef4444") ctx.fillStyle = `rgba(239,68,68,${alpha})`;
                else if (p.color === "#fbbf24") ctx.fillStyle = `rgba(251,191,36,${alpha})`;
                else if (p.color === "#f97316") ctx.fillStyle = `rgba(249,115,22,${alpha})`;
                else if (p.color === "#a78bfa") ctx.fillStyle = `rgba(167,139,250,${alpha})`;
                else if (p.color === "#34d399") ctx.fillStyle = `rgba(52,211,153,${alpha})`;
                else ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fill();
            }

            // --- HUD (positioned at edges, not overlapping center text) ---
            ctx.font = "bold 11px 'Geist Mono', monospace";

            // Timer top-center
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.fillText(formatTime(s.elapsedMs), canvas.width / 2, 35);

            // Score top-right
            ctx.textAlign = "right";
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.fillText(`${s.score}`, canvas.width - 20, 35);

            // Lives top-left
            ctx.textAlign = "left";
            for (let i = 0; i < PLAYER_LIVES; i++) {
                ctx.fillStyle = i < s.lives ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.06)";
                ctx.fillText("♥", 20 + i * 16, 35);
            }

            // Boss countdown bottom-right
            if (!s.bossDefeated && s.gamePhase === "normal") {
                ctx.textAlign = "right";
                ctx.fillStyle = "rgba(255,255,255,0.08)";
                ctx.font = "10px 'Geist Mono', monospace";
                ctx.fillText(`BOSS IN ${Math.max(0, BOSS_THRESHOLD - s.score)}`, canvas.width - 20, canvas.height - 20);
            }

            ctx.restore(); // screen shake
            animId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        canvas.addEventListener("mousemove", onMouseMove, { passive: true });
        canvas.addEventListener("click", onClick);
        animId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("click", onClick);
            cancelAnimationFrame(animId);
        };
    }, [textContainerRef, shootLaser, onBossDefeated, onGameOver]);

    return (
        <>
            {/* Leaderboard Button */}
            <button
                onClick={() => { if (!showLeaderboard) loadLeaderboard(); setShowLeaderboard(!showLeaderboard); }}
                className="absolute top-4 right-4 z-40 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
                style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            >
                🏆
            </button>

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center"
                    style={{ background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                    onClick={() => setShowLeaderboard(false)}
                >
                    <div
                        className="w-full max-w-md mx-4 bg-[#0a0a0f] border border-white/10 rounded-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold uppercase text-white font-mono">Leaderboard</h2>
                            <button
                                onClick={() => setShowLeaderboard(false)}
                                className="text-white/30 text-xs uppercase hover:text-white/60 transition-colors font-mono"
                            >
                                ✕
                            </button>
                        </div>


                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {loadingLeaderboard ? (
                                <div className="text-center py-8">
                                    <div className="inline-block w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                </div>
                            ) : leaderboard.length > 0 ? (
                                leaderboard.map((entry, i) => (
                                    <div
                                        key={entry.id || i}
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
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-white/20 text-sm py-8 font-mono">
                                    No entries yet. Be the first!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-30"
                style={{ cursor: "none" }}
            />
        </>
    );
};

export default RocketGame;
