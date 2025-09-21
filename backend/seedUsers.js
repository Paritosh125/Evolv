import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Habit from "./models/Habit.js";

dotenv.config();

const users = [
    {
        name: "Aria the Mage",
        email: "aria@evolv.com",
        password: "password123",
        level: 5,
        totalXpEarned: 1200,
        totalCoinsEarned: 350,
    },
    {
        name: "Kael the Warrior",
        email: "kael@evolv.com",
        password: "password123",
        level: 3,
        totalXpEarned: 800,
        totalCoinsEarned: 200,
    },
    {
        name: "Lyra the Rogue",
        email: "lyra@evolv.com",
        password: "password123",
        level: 4,
        totalXpEarned: 950,
        totalCoinsEarned: 250,
    },
    {
        name: "Dorin the Scholar",
        email: "dorin@evolv.com",
        password: "password123",
        level: 2,
        totalXpEarned: 400,
        totalCoinsEarned: 120,
    },
    {
        name: "Mira the Healer",
        email: "mira@evolv.com",
        password: "password123",
        level: 6,
        totalXpEarned: 1600,
        totalCoinsEarned: 500,
    },
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected...");

        // Clear users + habits
        await User.deleteMany();
        await Habit.deleteMany();

        for (let u of users) {
            const hashedPw = await bcrypt.hash(u.password, 10);
            const user = new User({
                name: u.name,
                email: u.email,
                password: hashedPw,
                level: u.level,
                totalXpEarned: u.totalXpEarned,
                totalCoinsEarned: u.totalCoinsEarned,
            });
            await user.save();

            // Add sample habits with streaks
            const sampleHabits = [
                {
                    title: "Morning Workout",
                    frequency: "daily",
                    progress: Math.floor(Math.random() * 10),
                    streak: Math.floor(Math.random() * 15),
                    user: user._id,
                },
                {
                    title: "Read a Book",
                    frequency: "weekly",
                    progress: Math.floor(Math.random() * 5),
                    streak: Math.floor(Math.random() * 7),
                    user: user._id,
                },
            ];

            await Habit.insertMany(sampleHabits);
        }

        console.log("Demo users + habits seeded ✅");
        process.exit();
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedUsers();
