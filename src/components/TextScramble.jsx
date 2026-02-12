import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

const TextScramble = ({ text, delay = 0, className = "", speed = 30 }) => {
    const [display, setDisplay] = useState("");
    const started = useRef(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            started.current = true;
            let iteration = 0;
            const length = text.length;

            const interval = setInterval(() => {
                const resolved = text.slice(0, iteration);
                const scrambled = Array.from({ length: length - iteration }, () =>
                    CHARS[Math.floor(Math.random() * CHARS.length)]
                ).join("");

                setDisplay(resolved + scrambled);

                iteration += 1;
                if (iteration > length) {
                    clearInterval(interval);
                    setDisplay(text);
                }
            }, speed);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [text, delay, speed]);

    return <span className={className}>{display || "\u00A0"}</span>;
};

export default TextScramble;
