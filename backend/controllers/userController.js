import User from "../models/User.js";
import Habit from "../models/Habit.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            xp: user.xp,
            coins: user.coins,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

// @desc    Login user
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            xp: user.xp,
            coins: user.coins,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
};

// GET: User profile (requires login)
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password") // don’t expose password
            .populate("badges", "name description type emoji xpReward coinReward coinCost")


        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch habits for streak & completion stats
        const habits = await Habit.find({ user: req.user._id });

        let totalCompletions = 0;
        let longestStreak = 0;
        let activeStreaks = 0;

        habits.forEach(habit => {
            totalCompletions += habit.completedCount || 0;
            if (habit.streak > longestStreak) longestStreak = habit.streak;
            if (habit.streak > 0) activeStreaks += 1;
        });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            xp: user.xp,
            coins: user.coins,
            totalCoinsEarned: user.totalCoinsEarned,
            level: user.level,

            // 🎖 badges unlocked
            badges: user.badges,

            // 📊 progress stats
            stats: {
                totalCompletions,
                longestStreak,
                activeStreaks,
                totalHabits: habits.length,
            },

            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching profile" });
    }
};

export { registerUser, loginUser };
