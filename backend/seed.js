// seedBadges.js
import mongoose from "mongoose";
import Badge from "./models/Badge.js";
import dotenv from "dotenv";

dotenv.config();

const badges = [
    {
        name: "Welcome Aboard",
        type: "purchasable",
        description: "Starter badge for all new users",
        emoji: "🎉",
        xpReward: 0,
        coinReward: 0,
        coinCost: 0,
    },
    {
        name: "Bronze Learner",
        type: "milestone",  // ✅ milestone instead of xp
        description: "Reached 20 XP",
        emoji: "🥉",
        xpReward: 0,
        coinReward: 5,
        condition: "20xp",
    },
    {
        name: "Silver Learner",
        type: "milestone",
        description: "Reached 50 XP",
        emoji: "🥈",
        xpReward: 0,
        coinReward: 10,
        condition: "50xp",
    },
    {
        name: "Gold Learner",
        type: "milestone",
        description: "Reached 100 XP",
        emoji: "🥇",
        xpReward: 0,
        coinReward: 20,
        condition: "100xp",
    },
    {
        name: "Platinum Learner",
        type: "milestone",
        description: "Reached 200 XP",
        emoji: "💎",
        xpReward: 0,
        coinReward: 40,
        condition: "200xp",
    },
    {
        name: "Evolver’s Pride",
        type: "purchasable",
        description: "Show your pride in Evolv",
        emoji: "⚔️",
        xpReward: 0,
        coinReward: 0,
        coinCost: 5,
    },
];


async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Badge.deleteMany({});
        await Badge.insertMany(badges);
        console.log("✅ Badges seeded!");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    }
}

seed();
