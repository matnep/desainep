import React, { useEffect, useRef } from "react";

const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const pos = useRef({ x: -100, y: -100 });
    const target = useRef({ x: -100, y: -100 });
    const isHovering = useRef(false);
    const dirty = useRef(true);

    useEffect(() => {
        let animId;

        const onMouseMove = (e) => {
            target.current.x = e.clientX;
            target.current.y = e.clientY;
            dirty.current = true;
        };

        const onMouseOver = (e) => {
            const el = e.target.closest("a, button, [data-cursor='pointer']");
            isHovering.current = !!el;
            dirty.current = true;
        };

        const loop = () => {
            // Lerp the ring position (smooth lag)
            const dx = target.current.x - pos.current.x;
            const dy = target.current.y - pos.current.y;
            pos.current.x += dx * 0.15;
            pos.current.y += dy * 0.15;

            // Only update DOM if still moving (dx/dy > 0.1px)
            if (dirty.current || Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                if (dotRef.current) {
                    dotRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%, -50%)`;
                }
                if (ringRef.current) {
                    const scale = isHovering.current ? 2.5 : 1;
                    const opacity = isHovering.current ? 0.3 : 0.5;
                    ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(${scale})`;
                    ringRef.current.style.opacity = opacity;
                }
                dirty.current = false;
            }

            animId = requestAnimationFrame(loop);
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        document.addEventListener("mouseover", onMouseOver);
        animId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseover", onMouseOver);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <>
            {/* Inner dot */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block"
                style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(52, 211, 153, 0.9)",
                    willChange: "transform",
                }}
            />
            {/* Outer ring */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 z-[9998] pointer-events-none hidden md:block"
                style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid rgba(52, 211, 153, 0.5)",
                    willChange: "transform",
                    transition: "opacity 0.3s, border-color 0.3s",
                }}
            />
        </>
    );
};

export default CustomCursor;
