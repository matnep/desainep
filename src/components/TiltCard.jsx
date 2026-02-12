import React, { useRef, useState } from "react";

const TiltCard = ({ children, className = "" }) => {
    const ref = useRef(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * 20;
        const tiltY = (x - 0.5) * 20;

        setStyle({
            transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: "transform 0.1s ease-out",
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ ...style, willChange: "transform" }}
        >
            <div
                className={className}
                style={{
                    isolation: "isolate",
                    borderRadius: "inherit",
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default TiltCard;
