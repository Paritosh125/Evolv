import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { FaWhatsapp, FaTwitter, FaInstagram, FaDownload } from "react-icons/fa";
import API from "../api"; // 👈 use axios instance
import domtoimage from "dom-to-image-more";



export default function Profile() {
    const [profile, setProfile] = useState(null);
    const badgeRefs = useRef({});



    useEffect(() => {
        API.get("/users/profile")
            .then((res) => setProfile(res.data))
            .catch((err) => console.error("Profile fetch error:", err.response?.data || err.message));
    }, []);

    if (!profile) return <p className="text-cyan-400">Loading...</p>;

    const captureBadge = async (badgeId) => {
        const card = badgeRefs.current[badgeId];
        if (!card) return null;
        try {
            const dataUrl = await domtoimage.toPng(card, { quality: 1, bgcolor: "#0a0f1c" });
            return dataUrl;
        } catch (err) {
            console.error("dom-to-image error:", err);
            return null;
        }
    };

    const handleDownload = async (badgeId, badgeName) => {
        const dataUrl = await captureBadge(badgeId);
        if (!dataUrl) return;
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${badgeName.replace(/\s+/g, "_")}.png`;
        link.click();
    };

    const handleShare = async (badgeId, platform) => {
        const dataUrl = await captureBadge(badgeId);
        if (!dataUrl) return;

        if (platform === "whatsapp") {
            window.open(`https://wa.me/?text=Check%20out%20my%20badge!%20${dataUrl}`);
        } else if (platform === "twitter") {
            window.open(`https://twitter.com/intent/tweet?text=Flexing%20my%20badge!&url=${dataUrl}`);
        } else if (platform === "instagram") {
            alert("Instagram doesn’t allow direct web share. We’ll download the image for you!");
            handleDownload(badgeId, "badge");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050d1a] to-[#0f1e33] text-white p-6">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-cyan-400">{profile.name}</h1>
                <p className="text-gray-400">{profile.email}</p>
                <p className="mt-2">
                    Level {profile.level} • {profile.xp} XP • {profile.coins} Coins
                </p>
            </div>

            <h2 className="text-2xl font-semibold text-cyan-300 mb-6">🎖 Your Badges</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.badges.map((badge) => (
                    <div
                        key={badge._id}
                        ref={(el) => (badgeRefs.current[badge._id] = el)}
                        className="relative bg-gradient-to-br from-cyan-900/50 to-cyan-700/30 border border-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/30 p-6 text-center"
                    >
                        <h3 className="absolute top-2 left-1/2 transform -translate-x-1/2 text-cyan-400 text-sm font-bold">
                            EVOLVE
                        </h3>
                        <div className="text-6xl mb-4">{badge.emoji}</div>
                        <h4 className="text-xl font-semibold text-cyan-300">{badge.name}</h4>
                        <p className="text-gray-300 text-sm mt-2">{badge.description}</p>
                        <p className="text-cyan-400 text-xs mt-3">
                            {badge.xpReward > 0 && `+${badge.xpReward} XP `}
                            {badge.coinReward > 0 && `+${badge.coinReward} Coins`}
                        </p>
                        <div className="flex justify-center gap-4 mt-5">
                            {/* <button onClick={() => handleShare(badge._id, "whatsapp")} className="text-green-400">
                                <FaWhatsapp size={22} />
                            </button>
                            <button onClick={() => handleShare(badge._id, "twitter")} className="text-blue-400">
                                <FaTwitter size={22} />
                            </button>
                            <button onClick={() => handleShare(badge._id, "instagram")} className="text-pink-400">
                                <FaInstagram size={22} />
                            </button> */}
                            <button onClick={() => handleDownload(badge._id, badge.name)} className="text-cyan-400">
                                <FaDownload size={22} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
