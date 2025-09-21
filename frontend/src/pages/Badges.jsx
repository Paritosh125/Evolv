import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../App";
import { motion } from "framer-motion";
import BadgeUnlock from "../components/BadgeUnlockPopup"; // 👈 import popup

export default function BadgeGallery() {
    const { token } = useContext(AuthContext);
    const [badges, setBadges] = useState([]);
    const [userBadges, setUserBadges] = useState([]);
    const [unlockedBadges, setUnlockedBadges] = useState([]);

    useEffect(() => {
        if (!token) return;
        fetchBadges();
        fetchUserBadges();
    }, [token]);

    async function fetchBadges() {
        try {
            const res = await api.get("/badges");
            setBadges(res.data || []);
        } catch (err) {
            console.error("Error fetching badges:", err);
        }
    }

    async function fetchUserBadges() {
        try {
            const res = await api.get("/users/profile");
            setUserBadges(res.data?.badges || []);
        } catch (err) {
            console.error("Error fetching user badges:", err);
        }
    }

    function isUnlocked(badgeId) {
        return userBadges.some((b) => b._id === badgeId);
    }

    async function handlePurchase(badgeId, name) {
        try {
            const res = await api.post(`/badges/buy/${badgeId}`);
            await fetchUserBadges();
            setUnlockedBadges([res.data.badge]); // 👈 trigger modal
        } catch (err) {
            alert(err?.response?.data?.message || "Purchase failed");
        }
    }

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-blue-400">🏅 Badge Gallery</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {badges.map((badge) => {
                    const unlocked = isUnlocked(badge._id);
                    return (
                        <motion.div
                            key={badge._id}
                            whileHover={{ scale: 1.05 }}
                            className={`relative rounded-xl p-5 flex flex-col items-center justify-center border
                bg-[#0a0f1c] border-blue-600 text-center transition
                ${unlocked ? "shadow-[0_0_20px_#FFD700]" : "opacity-80"}
              `}
                        >
                            <div className="text-5xl mb-3">{badge.emoji}</div>
                            <h3 className="text-lg font-semibold text-blue-300">{badge.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{badge.description}</p>

                            {(badge.xpReward > 0 || badge.coinReward > 0) && (
                                <p className="text-xs mt-2 text-green-400">
                                    {badge.xpReward > 0 && `+${badge.xpReward} XP `}
                                    {badge.coinReward > 0 && `+${badge.coinReward} 💰`}
                                </p>
                            )}

                            {badge.coinCost > 0 && (
                                <div className="mt-3">
                                    {unlocked ? (
                                        <p className="text-sm text-yellow-400">Purchased ✅</p>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(badge._id, badge.name)}
                                            className="px-3 py-1 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-600"
                                        >
                                            Buy for {badge.coinCost} 💰
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* 🔔 Popup for newly unlocked badges */}
            <BadgeUnlock
                badges={unlockedBadges}
                onClose={() => setUnlockedBadges([])}
            />
        </div>
    );
}
