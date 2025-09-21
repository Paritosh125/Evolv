import User from "../models/User.js";
import Badge from "../models/Badge.js";

// ✅ Earn coins
export const earnCoins = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.coins += amount;
        user.totalCoinsEarned += amount;
        await user.save();

        res.json({ message: `+${amount} coins earned!`, coins: user.coins });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Spend coins (buy badge)
export const spendCoins = async (req, res) => {
    try {
        const { userId, badgeId } = req.body;
        const user = await User.findById(userId).populate("badges"); // ✅ populate badges
        const badge = await Badge.findById(badgeId);

        if (!user || !badge) {
            return res.status(404).json({ message: "User or Badge not found" });
        }

        // Check if badge is purchasable
        if (badge.type !== "purchasable" || badge.coinCost <= 0) {
            return res
                .status(400)
                .json({ message: "This badge cannot be bought with coins" });
        }

        // Already unlocked?
        if (user.badges.some((b) => b._id.equals(badge._id))) {
            return res.status(400).json({ message: "Badge already unlocked" });
        }

        // Enough coins?
        if (user.coins < badge.coinCost) {
            return res.status(400).json({ message: "Not enough coins" });
        }

        // Deduct coins & unlock badge
        user.coins -= badge.coinCost;
        user.badges.push(badge._id);
        await user.save();

        // Return updated populated badges array
        const updatedUser = await User.findById(userId).populate(
            "badges",
            "name description type coinCost"
        );

        res.json({
            message: `Unlocked badge: ${badge.name}`,
            coins: updatedUser.coins,
            badges: updatedUser.badges,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
