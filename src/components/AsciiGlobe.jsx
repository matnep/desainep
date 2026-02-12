import React, { useEffect, useRef, useCallback } from "react";

const AsciiGlobe = ({ size = 22, speed = 0.8, className = "" }) => {
    const canvasRef = useRef(null);
    const angleRef = useRef({ A: 0, B: 0 });
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const frameRef = useRef(null);

    const R = size;
    const gridW = R * 2;
    const gridH = R * 2;

    const handleMouseMove = useCallback((e) => {
        mouseRef.current = {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
        };
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const chars = ".,-~:;=!*#$@";

        // Measure character dimensions once
        const charW = 9;
        const charH = 12;
        canvas.width = gridW * charW;
        canvas.height = gridH * charH;

        const getColor = (yNorm) => {
            const t = (yNorm + 1) / 2;
            let r, g, b;
            if (t < 0.5) {
                const s = t * 2;
                r = 0 + s * 52 | 0;
                g = 220 + s * -9 | 0;
                b = 255 + s * -102 | 0;
            } else {
                const s = (t - 0.5) * 2;
                r = 52 + s * 115 | 0;
                g = 211 + s * -72 | 0;
                b = 153 + s * 97 | 0;
            }
            return `rgb(${r},${g},${b})`;
        };

        const render = () => {
            const mx = (mouseRef.current.x - 0.5) * 2;
            const my = (mouseRef.current.y - 0.5) * 2;

            angleRef.current.A += (0.004 + my * 0.008) * speed;
            angleRef.current.B += (0.008 + mx * 0.012) * speed;

            const A = angleRef.current.A;
            const B = angleRef.current.B;

            const buffer = new Array(gridW * gridH);
            const zBuffer = new Float32Array(gridW * gridH);
            const yPosBuffer = new Float32Array(gridW * gridH);
            buffer.fill(0); // 0 = empty

            const sinA = Math.sin(A), cosA = Math.cos(A);
            const sinB = Math.sin(B), cosB = Math.cos(B);

            for (let theta = 0; theta < 6.2832; theta += 0.05) {
                const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);
                for (let phi = 0; phi < 3.1416; phi += 0.015) {
                    const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);

                    const x = sinPhi * cosTheta;
                    const y = cosPhi;
                    const z = sinPhi * sinTheta;

                    const rx = x * cosB - z * sinB;
                    const t1 = x * sinB + z * cosB;
                    const ry = y * cosA - t1 * sinA;
                    const rz = y * sinA + t1 * cosA;

                    const ooz = 1 / (rz + 3);
                    const xp = (gridW / 2 + R * 0.95 * ooz * rx) | 0;
                    const yp = (gridH / 2 + R * 0.95 * ooz * ry) | 0;

                    if (xp >= 0 && xp < gridW && yp >= 0 && yp < gridH) {
                        const idx = yp * gridW + xp;
                        if (ooz > zBuffer[idx]) {
                            zBuffer[idx] = ooz;
                            const L = sinPhi * sinTheta * sinA - cosPhi * cosA;
                            const luminance = L > 0 ? L : 0;
                            buffer[idx] = (luminance * 11 | 0) + 1; // 1-12 = char index + 1
                            yPosBuffer[idx] = ry;
                        }
                    }
                }
            }

            // Draw to canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${charH}px "Geist Mono", monospace`;
            ctx.textBaseline = "top";

            for (let j = 0; j < gridH; j++) {
                for (let i = 0; i < gridW; i++) {
                    const idx = j * gridW + i;
                    const charIdx = buffer[idx];
                    if (charIdx > 0) {
                        ctx.fillStyle = getColor(yPosBuffer[idx]);
                        ctx.fillText(chars[charIdx - 1], i * charW, j * charH);
                    }
                }
            }

            frameRef.current = requestAnimationFrame(render);
        };

        frameRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frameRef.current);
    }, [size, speed, R, gridW, gridH]);

    return (
        <canvas
            ref={canvasRef}
            className={`select-none ${className}`}
            style={{
                width: `min(${gridW * 9}px, 90vw)`,
                height: "auto",
                imageRendering: "pixelated",
                aspectRatio: `${gridW} / ${gridH}`,
            }}
            aria-hidden="true"
        />
    );
};

export default AsciiGlobe;
