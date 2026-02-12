import React from "react";

const NebulaStars = () => {
    const stars = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
        },
    }));

    return (
        <div className="nebula-stars">
            {stars.map((star) => (
                <div key={star.id} className="nebula-star" style={star.style} />
            ))}
        </div>
    );
};

export default NebulaStars;
