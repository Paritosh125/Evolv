import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* simple carousel with 3 slides (text + subtle gradient) */
const slides = [
    { id: 1, title: "Turn your routine into a quest", subtitle: "Earn XP, unlock badges, level up daily." },
    { id: 2, title: "Streaks fuel progression", subtitle: "Keep streaks to boost rewards and multipliers." },
    { id: 3, title: "Compete on the leaderboard", subtitle: "See how you stack up with other players." },
];

export default function Carousel() {
    const [i, setI] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setI((s) => (s + 1) % slides.length), 4200);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="relative w-full max-w-4xl h-56 sm:h-72 mx-auto overflow-hidden rounded-2xl">
            <AnimatePresence initial={false}>
                <motion.div
                    key={slides[i].id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 flex items-center justify-center p-6"
                    style={{
                        background: `linear-gradient(135deg, rgba(233,69,96,0.14), rgba(59,130,246,0.06))`,
                        border: "1px solid rgba(255,255,255,0.03)",
                    }}
                >
                    <div className="text-center">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-reward mb-2">{slides[i].title}</h3>
                        <p className="text-sm sm:text-base text-primary max-w-lg mx-auto">{slides[i].subtitle}</p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
