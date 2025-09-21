import User from "../models/User.js";
import Habit from "../models/Habit.js";

export const getLeaderboard = async (req, res) => {
    try {
        const { type = "xp" } = req.query; // xp | coins | level | streak

        if (type === "streak") {
            // Aggregate longest streaks per user
            const streaks = await Habit.aggregate([
                { $group: { _id: "$user", longestStreak: { $max: "$streak" } } },
                { $sort: { longestStreak: -1 } },
                { $limit: 10 },
            ]);

            const streakUsers = await User.find({
                _id: { $in: streaks.map((s) => s._id) },
            }).select("name email");

            const result = streaks.map((s) => {
                const u = streakUsers.find(
                    (user) => user._id.toString() === s._id.toString()
                );
                return { name: u?.name, email: u?.email, streak: s.longestStreak };
            });

            return res.json({ type, leaderboard: result });
        }

        // XP, Coins, or Level Leaderboard
        const sortField =
            type === "coins"
                ? "totalCoinsEarned"
                : type === "level"
                    ? "level"
                    : "totalXpEarned"; // default XP

        const users = await User.find()
            .sort({ [sortField]: -1 })
            .limit(10)
            .select("name email level totalXpEarned totalCoinsEarned");

        res.json({ type, leaderboard: users });
    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ message: "Error fetching leaderboard" });
    }
};
