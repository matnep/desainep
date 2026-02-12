import React from "react";

const Marquee = ({ text = "LET'S CREATE SOMETHING EXTRAORDINARY", variant = "default" }) => {
    const items = [...Array(10)].map((_, i) => (
        <span key={i} className="flex items-center gap-6 mr-6">
            <span
                className={`text-2xl md:text-4xl font-extrabold font-geist uppercase tracking-tight whitespace-nowrap ${variant === "outline"
                        ? "text-transparent"
                        : "text-white/10"
                    }`}
                style={
                    variant === "outline"
                        ? { WebkitTextStroke: "1px rgba(255,255,255,0.15)" }
                        : {}
                }
            >
                {text}
            </span>
            <span className="text-white/10 text-2xl">◆</span>
        </span>
    ));

    return (
        <div className="w-full overflow-hidden py-8 md:py-12 bg-[#050505] border-y border-white/5">
            <div className="animate-marquee flex whitespace-nowrap">{items}</div>
        </div>
    );
};

export default Marquee;
