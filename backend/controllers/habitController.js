// controllers/habitController.js
import Habit from "../models/Habit.js";
import User from "../models/User.js";
import { checkAndAwardBadges } from "../utils/badgeService.js";
import { classifyDifficulty } from "../utils/difficulty.js";

/**
 * Config / tuning parameters
 */
const BASE_XP = { easy: 10, medium: 20, hard: 30 };
const BASE_COINS = { easy: 1, medium: 2, hard: 3 };

const FTUE_BOOSTS = [
    { maxCompletions: 1, xpMultiplier: 4, coinMultiplier: 4 },
    { maxCompletions: 3, xpMultiplier: 2, coinMultiplier: 2 },
];

const STREAK_MULTIPLIER = (streakDays) => {
    if (streakDays >= 7) return 1.5;
    if (streakDays >= 3) return 1.2;
    return 1.0;
};

const LEVEL_XP_BASE = 100;

// ------------------- Controllers -------------------

export const addHabit = async (req, res) => {
    try {
        const {
            title,
            description = "",
            frequency = "daily",
            estimatedTime = 0,
            difficulty,
        } = req.body;

        const resolvedDifficulty = difficulty
            ? difficulty
            : classifyDifficulty({ title, description, estimatedTime });

        const habit = await Habit.create({
            user: req.user._id,
            title,
            description,
            frequency,
            estimatedTime,
            difficulty: resolvedDifficulty,
            streak: 0,
            completedCount: 0,
        });

        res.status(201).json(habit);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Error creating habit", error: err.message });
    }
};

export const getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(habits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const completeHabit = async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ message: "Habit not found" });
        if (habit.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Not authorized" });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const todayStr = new Date().toDateString();
        const lastCompletedStr = habit.lastCompleted
            ? new Date(habit.lastCompleted).toDateString()
            : null;

        if (lastCompletedStr === todayStr) {
            return res.status(200).json({
                message: "Habit already completed today",
                habit,
            });
        }

        // Update streak
        let yesterdayStr = new Date();
        yesterdayStr.setDate(yesterdayStr.getDate() - 1);
        yesterdayStr = yesterdayStr.toDateString();

        if (lastCompletedStr === yesterdayStr) {
            habit.streak = (habit.streak || 0) + 1;
        } else {
            habit.streak = 1;
        }

        habit.lastCompleted = new Date();
        habit.completedCount = (habit.completedCount || 0) + 1;

        // Rewards
        const difficulty = habit.difficulty || "medium";
        let baseXp = BASE_XP[difficulty] || BASE_XP.medium;
        let baseCoins = BASE_COINS[difficulty] || BASE_COINS.medium;

        user.totalCompleted = user.totalCompleted || 0;

        let xpMultiplier = 1;
        let coinMultiplier = 1;
        for (const boost of FTUE_BOOSTS) {
            if (user.totalCompleted < boost.maxCompletions) {
                xpMultiplier = boost.xpMultiplier;
                coinMultiplier = boost.coinMultiplier;
                break;
            }
        }

        const streakMult = STREAK_MULTIPLIER(habit.streak);

        const xpEarned = Math.round(baseXp * xpMultiplier * streakMult);
        const coinsEarned = Math.round(baseCoins * coinMultiplier);

        // Update user
        user.xp = (user.xp || 0) + xpEarned;
        user.coins = (user.coins || 0) + coinsEarned;
        user.totalCompleted += 1;
        user.totalXpEarned = (user.totalXpEarned || 0) + xpEarned;
        user.totalCoinsEarned = (user.totalCoinsEarned || 0) + coinsEarned;

        let leveledUp = false;
        while (user.xp >= LEVEL_XP_BASE * user.level) {
            user.xp -= LEVEL_XP_BASE * user.level;
            user.level = (user.level || 1) + 1;
            leveledUp = true;
            user.coins += 5;
        }

        await habit.save();
        await user.save();

        // 🏅 Check & unlock badges
        const unlockedBadges = await checkAndAwardBadges(user._id, "completeHabit", {
            streak: habit.streak,
            category: habit.category,
        });

        res.json({
            message: "Habit completed",
            habit: {
                id: habit._id,
                title: habit.title,
                streak: habit.streak,
                lastCompleted: habit.lastCompleted,
                completedCount: habit.completedCount,
            },
            rewards: {
                xpEarned,
                coinsEarned,
                leveledUp,
                newLevel: user.level,
                userXpRemainder: user.xp,
                userCoins: user.coins,
            },
            unlockedBadges,
        });
    } catch (err) {
        console.error("completeHabit error:", err);
        res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

export const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ message: "Habit not found" });

        if (habit.user.toString() !== req.user._id.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to delete this habit" });
        }

        await Habit.findByIdAndDelete(req.params.id);
        res.json({ message: "Habit deleted successfully" });
    } catch (error) {
        console.error("deleteHabit error:", error);
        res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
};
