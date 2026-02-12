import React, { useRef, useState } from "react";

const MagneticButton = ({ children, className = "", ...props }) => {
    const ref = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        setOffset({ x: dx * 0.3, y: dy * 0.3 });
    };

    const handleMouseLeave = () => {
        setOffset({ x: 0, y: 0 });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="inline-block"
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                transition: offset.x === 0 ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" : "transform 0.1s ease-out",
            }}
        >
            <div className={className} data-cursor="pointer" {...props}>
                {children}
            </div>
        </div>
    );
};

export default MagneticButton;
