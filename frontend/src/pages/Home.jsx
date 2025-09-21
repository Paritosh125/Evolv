import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const carouselItems = [
    "Forge New Habits ⚔️",
    "Unlock Badges 🎖️",
    "Compete on Leaderboards 🏆",
    "Share Your Progress 🌍",
];

export default function Home() {
    const [current, setCurrent] = useState(0);

    const navigate = useNavigate();

    const handleStart = () => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard"); // already logged in → go to dashboard
        } else {
            navigate("/auth"); // not logged in → go to login/signup
        }
    };

    // Auto-play carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % carouselItems.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white flex flex-col">
            {/* Navbar with Evolv Logo */}
            <header className="flex justify-center sm:justify-start items-center px-6 py-4 border-b border-gray-800">
                <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Evolv
                </h1>
            </header>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-12">
                {/* Carousel */}
                <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400 mb-6"
                >
                    {carouselItems[current]}
                </motion.div>

                {/* Hero Title */}
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                >
                    Level Up Your Habits ⚔️
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="max-w-2xl text-gray-300 text-lg sm:text-xl mb-8"
                >
                    Transform your daily routines into an epic RPG adventure.
                    Track progress, earn rewards, and conquer challenges.
                </motion.p>

                {/* Start Journey Button (redirect to login/signup) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <button
                        onClick={handleStart}
                        className="px-8 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-blue-700 
        hover:from-blue-600 hover:to-indigo-800 shadow-lg transition-all"
                    >
                        Start Your Journey
                    </button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-800">
                © {new Date().getFullYear()} Evolv. All rights reserved.
            </footer>
        </div>
    );
}
