import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "./MagneticButton";

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: "$2,999",
        period: "per project",
        desc: "For startups making their mark.",
        color: "from-teal-400 to-cyan-400",
        features: [
            { name: "Single Page Website", included: true },
            { name: "Responsive Design", included: true },
            { name: "Basic SEO", included: true },
            { name: "2 Revision Rounds", included: true },
            { name: "Custom Animations", included: false },
            { name: "CMS Integration", included: false },
            { name: "Priority Support", included: false },
            { name: "Dedicated Manager", included: false },
        ],
    },
    {
        id: "growth",
        name: "Growth",
        price: "$7,999",
        period: "per project",
        desc: "For scaling businesses.",
        color: "from-violet-400 to-blue-400",
        popular: true,
        features: [
            { name: "Multi-page Website (10+)", included: true },
            { name: "Responsive Design", included: true },
            { name: "Advanced SEO & Analytics", included: true },
            { name: "5 Revision Rounds", included: true },
            { name: "Custom Animations", included: true },
            { name: "CMS Integration", included: true },
            { name: "Priority Support", included: true },
            { name: "Dedicated Manager", included: false },
        ],
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        period: "tailored",
        desc: "For complex digital ecosystems.",
        color: "from-orange-400 to-rose-400",
        features: [
            { name: "Custom Web Application", included: true },
            { name: "Responsive Design", included: true },
            { name: "Performance & Security Audit", included: true },
            { name: "Unlimited Revisions", included: true },
            { name: "Custom Animations", included: true },
            { name: "API Development", included: true },
            { name: "24/7 Priority Support", included: true },
            { name: "Dedicated Manager", included: true },
        ],
    },
];

const Pricing = () => {
    const [active, setActive] = useState(1);
    const plan = plans[active];

    return (
        <section id="pricing" className="py-24 md:py-32 bg-[#050505]">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-white/30 font-geist-mono text-xs uppercase tracking-[0.3em]">
            // pricing
                    </span>
                    <h2 className="mt-4 text-4xl md:text-6xl font-extrabold font-geist text-white leading-[0.95]">
                        Simple pricing<span className="text-emerald-400">.</span>
                    </h2>
                </motion.div>

                {/* Plan selector tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex justify-center mb-12"
                >
                    <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/5">
                        {plans.map((p, i) => (
                            <button
                                key={p.id}
                                onClick={() => setActive(i)}
                                className={`relative px-6 py-3 rounded-xl text-sm font-semibold font-geist transition-all duration-300 cursor-pointer ${active === i
                                        ? "text-black"
                                        : "text-white/40 hover:text-white/60"
                                    }`}
                            >
                                {active === i && (
                                    <motion.div
                                        layoutId="pricingTab"
                                        className="absolute inset-0 bg-white rounded-xl"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{p.name}</span>
                                {p.popular && (
                                    <span className={`relative z-10 ml-2 px-1.5 py-0.5 text-[9px] rounded-md font-geist-mono font-bold uppercase tracking-wider ${active === i ? "bg-emerald-400 text-black" : "bg-white/10 text-white/30"
                                        }`}>
                                        Hot
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Active plan card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden"
                    >
                        {/* Top gradient strip */}
                        <div className={`h-1 bg-gradient-to-r ${plan.color}`} />

                        <div className="p-8 md:p-12">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                                <div>
                                    <span className={`text-sm font-bold font-geist bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                                        {plan.name}
                                    </span>
                                    <div className="mt-2 flex items-baseline gap-3">
                                        <span className="text-6xl md:text-7xl font-black font-geist text-white">
                                            {plan.price}
                                        </span>
                                        <span className="text-white/20 text-sm font-geist">
                                            {plan.period}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-white/30 text-sm font-geist">
                                        {plan.desc}
                                    </p>
                                </div>

                                <MagneticButton className="cursor-pointer px-8 py-4 bg-white text-black font-bold text-sm rounded-full hover:bg-emerald-400 transition-colors font-geist shrink-0">
                                    Get started →
                                </MagneticButton>
                            </div>

                            {/* Feature grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {plan.features.map((f, i) => (
                                    <motion.div
                                        key={f.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl ${f.included
                                                ? "bg-white/[0.03]"
                                                : "bg-transparent opacity-30"
                                            }`}
                                    >
                                        <span className={`text-sm ${f.included ? "text-emerald-400" : "text-white/20"}`}>
                                            {f.included ? "✓" : "—"}
                                        </span>
                                        <span className={`text-sm font-geist ${f.included ? "text-white/60" : "text-white/20 line-through"}`}>
                                            {f.name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Pricing;
