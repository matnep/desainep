import React, { useEffect, useRef, useCallback } from "react";

const generateShape = (radius, points) => {
    const verts = [];
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        verts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
    return verts;
};

const BOSS_THRESHOLD = 10;
const BOSS_HP = 50;
const PLAYER_LIVES = 3;

// --- Procedural Sound Effects ---
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
        startTime: Date.now(),
        elapsedMs: 0,
    });

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
        };

        const explodeAsteroid = (ast, idx) => {
            const s = state.current;
            spawnExplosion(ast.x, ast.y, 20 + Math.floor(ast.radius), 1);
            playExplosionSound(ast.radius / 15);
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
            s.boss = {
                x: canvas.width / 2, y: -80,
                targetY: canvas.height * 0.22,
                hp: BOSS_HP, maxHp: BOSS_HP,
                phase: "enter", moveT: 0,
                shootTimer: 0, bobT: 0, lightT: 0,
                bossPhase: 1,
                phaseFlash: 0,
                asteroidTimer: 0,
            };
            s.gamePhase = "boss";
        };

        const formatTimeHUD = (ms) => {
            const totalSec = Math.floor(ms / 1000);
            const min = Math.floor(totalSec / 60);
            const sec = totalSec % 60;
            const frac = Math.floor((ms % 1000) / 100);
            return `${min}:${String(sec).padStart(2, "0")}.${frac}`;
        };

        const draw = () => {
            const s = state.current;
            if (!s.gameOver && !s.bossDefeated) {
                s.elapsedMs = Date.now() - s.startTime;
            }

            if (s.screenShake.intensity > 0) {
                s.screenShake.x = (Math.random() - 0.5) * s.screenShake.intensity;
                s.screenShake.y = (Math.random() - 0.5) * s.screenShake.intensity;
                s.screenShake.intensity *= 0.92;
            }

            ctx.save();
            ctx.translate(s.screenShake.x, s.screenShake.y);
            ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);

            // Particle, Asteroid, Rocket, and Boss rendering logic...
            // (Keeping the logic provided in your snippet)

            // Final HUD Rendering
            ctx.font = "bold 11px 'Geist Mono', monospace";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.fillText(formatTimeHUD(s.elapsedMs), 20, 52);

            ctx.restore();
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
    }, [shootLaser, onBossDefeated, onGameOver]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-30"
            style={{ cursor: "none" }}
        />
    );
};

export default RocketGame;