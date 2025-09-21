import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../App";
import { Trophy, Coins, Star, Flame } from "lucide-react";

export default function Leaderboard() {
    const { token } = useContext(AuthContext);
    const [data, setData] = useState([]);
    const [type, setType] = useState("xp");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `https://evolv-125.onrender.com/api/leaderboard?type=${type}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setData(res.data.leaderboard || []);
            } catch (err) {
                console.error("Leaderboard fetch error:", err);
            }
        };
        if (token) fetchData();
    }, [type, token]);

    const icons = {
        xp: <Star className="inline w-5 h-5 text-blue-400" />,
        coins: <Coins className="inline w-5 h-5 text-yellow-400" />,
        level: <Trophy className="inline w-5 h-5 text-purple-400" />,
        streak: <Flame className="inline w-5 h-5 text-red-400" />,
    };

    return (
        <div className="min-h-screen bg-background text-text px-6 py-10">
            <h1 className="text-3xl font-extrabold mb-8 text-center flex items-center justify-center gap-2">
                🏆 Leaderboard – {type.toUpperCase()}
            </h1>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                {["xp", "coins", "level", "streak"].map((t) => (
                    <button
                        key={t}
                        className={`px-5 py-2 rounded-xl font-semibold transition-all ${t === type
                            ? "bg-accent text-white shadow-lg shadow-accent/50 scale-105"
                            : "bg-card hover:bg-accent/30"
                            }`}
                        onClick={() => setType(t)}
                    >
                        {t.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Leaderboard List */}
            <div className="max-w-2xl mx-auto space-y-4">
                {data.map((u, idx) => {
                    const isTop3 = idx < 3;
                    const rankColors = ["text-yellow-400", "text-gray-300", "text-orange-400"];
                    return (
                        <div
                            key={u._id || idx}
                            className="flex items-center justify-between p-4 rounded-2xl bg-card/80 border border-accent/40 backdrop-blur-md shadow-md hover:scale-[1.02] transition-all"
                        >
                            {/* Rank */}
                            <span
                                className={`text-2xl font-bold ${isTop3 ? rankColors[idx] : "text-text/70"
                                    }`}
                            >
                                {idx + 1}
                            </span>

                            {/* User Info */}
                            <span className="flex-1 ml-4 font-medium">{u.name}</span>

                            {/* Stat */}
                            <span className="flex items-center gap-2 font-semibold">
                                {icons[type]}
                                {type === "xp" && <>{u.totalXpEarned} XP</>}
                                {type === "coins" && <>{u.totalCoinsEarned} 💰</>}
                                {type === "level" && <>Lvl {u.level}</>}
                                {type === "streak" && <>{u.streak}🔥</>}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
