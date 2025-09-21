import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log("✅ Connected to DB... clearing old test users...");
        await User.deleteMany({ email: /@test\.com$/ }); // delete previous test users

        const users = [];
        for (let i = 1; i <= 10; i++) {
            const randomXp = Math.floor(Math.random() * 500);
            const randomCoins = Math.floor(Math.random() * 300);
            const randomLevel = Math.floor(randomXp / 100) + 1;

            users.push({
                name: `User${i}`,
                email: `user${i}@test.com`,
                password: await bcrypt.hash("123456", 10),
                xp: randomXp,
                coins: randomCoins,
                level: randomLevel,
                badges: []
            });
        }

        await User.insertMany(users);
        console.log("🎯 Dummy users seeded successfully!");
        process.exit();
    } catch (err) {
        console.error("❌ Seeder error:", err);
        process.exit(1);
    }
};

seedUsers();
