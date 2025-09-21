// components/BadgeUnlockPopup.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { X } from "lucide-react";

export default function BadgeUnlockPopup({ badges = [], onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (badges.length > 0) {
            // 🎊 Fire confetti when badges appear
            launchConfetti();

            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [badges, onClose]);

    const launchConfetti = () => {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    return (
        <AnimatePresence>
            {visible && badges.length > 0 && (
                <motion.div
                    className="fixed top-4 right-4 z-50 w-80 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl border p-4"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold">🎉 Badge Unlocked!</h3>
                            {badges.map((badge) => (
                                <div
                                    key={badge._id}
                                    className="mt-2 flex items-center gap-3 rounded-lg bg-blue-500/20 p-2"
                                >
                                    <span className="text-2xl">{badge.emoji}</span>
                                    <div>
                                        <p className="font-semibold">{badge.name}</p>
                                        <p className="text-sm text-gray-200">{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setVisible(false);
                                if (onClose) onClose();
                            }}
                            className="text-gray-200 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
