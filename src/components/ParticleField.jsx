import React, { useEffect, useRef } from "react";

const ParticleField = () => {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: true });
        let animId;
        let dots = [];
        let visible = true;

        const SPACING = 58;
        const RADIUS = 150;
        const RADIUS_SQ = RADIUS * RADIUS;
        const INTERACT_SQ = (RADIUS * 1.4) * (RADIUS * 1.4);
        const PUSH = 40;
        const MAX_CONN_SQ = (SPACING * 1.6) * (SPACING * 1.6);

        // Pause when off-screen
        const observer = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                if (visible && !animId) animId = requestAnimationFrame(draw);
            },
            { threshold: 0 }
        );
        observer.observe(canvas);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDots();
        };

        const initDots = () => {
            dots = [];
            const cols = Math.ceil(canvas.width / SPACING) + 1;
            const rows = Math.ceil(canvas.height / SPACING) + 1;
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    dots.push({
                        ox: i * SPACING,
                        oy: j * SPACING,
                        x: i * SPACING,
                        y: j * SPACING,
                    });
                }
            }
        };

        const onMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        let nearDots = [];

        const draw = () => {
            if (!visible) { animId = 0; return; }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const mx = mouse.current.x;
            const my = mouse.current.y;
            nearDots.length = 0;

            // Batch all dim dots into one path
            ctx.beginPath();
            const dimAlpha = 0.06;

            for (let d = 0; d < dots.length; d++) {
                const dot = dots[d];
                const dx = dot.ox - mx;
                const dy = dot.oy - my;
                const distSq = dx * dx + dy * dy;

                if (distSq < RADIUS_SQ) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / RADIUS) * PUSH;
                    const angle = Math.atan2(dy, dx);
                    dot.x += (dot.ox + Math.cos(angle) * force - dot.x) * 0.18;
                    dot.y += (dot.oy + Math.sin(angle) * force - dot.y) * 0.18;
                } else {
                    dot.x += (dot.ox - dot.x) * 0.08;
                    dot.y += (dot.oy - dot.y) * 0.08;
                }

                const dmx = dot.x - mx;
                const dmy = dot.y - my;
                const dMouseSq = dmx * dmx + dmy * dmy;

                if (dMouseSq < INTERACT_SQ) {
                    nearDots.push(dot);
                } else {
                    // Add dim dot to batch path
                    ctx.moveTo(dot.x + 1, dot.y);
                    ctx.arc(dot.x, dot.y, 1, 0, 6.2832);
                }
            }

            // Draw all dim dots in one call
            ctx.fillStyle = `rgba(38,38,38,${dimAlpha})`;
            ctx.fill();

            // Draw bright dots individually (fewer)
            for (let i = 0; i < nearDots.length; i++) {
                const dot = nearDots[i];
                const ddx2 = dot.x - dot.ox;
                const ddy2 = dot.y - dot.oy;
                const displaceSq = ddx2 * ddx2 + ddy2 * ddy2;
                const intensity = Math.min(displaceSq / (PUSH * PUSH), 1);
                const alpha = 0.15 + intensity * 0.65;
                const size = 1 + intensity * 1.8;
                const r = (38 + 14 * intensity) | 0;
                const g = (38 + 173 * intensity) | 0;
                const b = (38 + 115 * intensity) | 0;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, size, 0, 6.2832);
                ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
                ctx.fill();
            }

            // Draw connections only among nearDots
            if (nearDots.length > 1) {
                ctx.lineWidth = 0.5;
                const len = nearDots.length;
                for (let i = 0; i < len - 1; i++) {
                    const a = nearDots[i];
                    for (let j = i + 1; j < len; j++) {
                        const b = nearDots[j];
                        const cdx = a.x - b.x;
                        const cdy = a.y - b.y;
                        const cdSq = cdx * cdx + cdy * cdy;
                        if (cdSq < MAX_CONN_SQ) {
                            const admx = a.x - mx;
                            const admy = a.y - my;
                            const bdmx = b.x - mx;
                            const bdmy = b.y - my;
                            const aDist = Math.sqrt(admx * admx + admy * admy);
                            const bDist = Math.sqrt(bdmx * bdmx + bdmy * bdmy);
                            const nearDist = aDist < bDist ? aDist : bDist;
                            const lineAlpha = (1 - nearDist / (RADIUS * 1.2)) * 0.15;
                            if (lineAlpha > 0.01) {
                                ctx.beginPath();
                                ctx.moveTo(a.x, a.y);
                                ctx.lineTo(b.x, b.y);
                                ctx.strokeStyle = `rgba(52,211,153,${lineAlpha})`;
                                ctx.stroke();
                            }
                        }
                    }
                }
            }

            animId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMouseMove, { passive: true });
        animId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(animId);
            observer.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ opacity: 0.8 }}
        />
    );
};

export default ParticleField;
