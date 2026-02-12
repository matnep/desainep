import React, { useRef } from "react";
import MagneticButton from "./MagneticButton";

const Footer = () => {
    return (
        <footer className="bg-[#050505] border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32">
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black font-geist uppercase text-white leading-[0.9] tracking-tight">
                        LET'S
                        <span className="text-emerald-400"> WORK</span>
                        <br />
                        TOGETHER
                    </h2>
                    <div className="mt-10 flex justify-center">
                        <MagneticButton className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-emerald-400 transition-all font-geist">
                            Start a project
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </MagneticButton>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                            <span className="text-black font-bold text-[10px] font-geist-mono">D.</span>
                        </div>
                        <span className="text-white/20 font-geist-mono text-xs">
                            © 2026 desainep
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        {["Twitter", "GitHub", "Dribbble", "LinkedIn"].map((s) => (
                            <MagneticButton key={s} className="cursor-pointer">
                                <a href="#" className="text-white/20 hover:text-emerald-400 text-xs font-geist-mono transition-colors">
                                    {s}
                                </a>
                            </MagneticButton>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-white/20 hover:text-white text-xs font-geist-mono transition-colors">Privacy</a>
                        <a href="#" className="text-white/20 hover:text-white text-xs font-geist-mono transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
