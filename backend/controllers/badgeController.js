import Badge from "../models/Badge.js";
import User from "../models/User.js";

// GET all badges
export const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching badges" });
  }
};

// POST: Buy a badge
export const buyBadge = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const badge = await Badge.findById(req.params.badgeId);

    if (!badge) return res.status(404).json({ message: "Badge not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (badge.type !== "purchasable") {
      return res.status(400).json({ message: "This badge cannot be purchased" });
    }

    if (badge.coinCost <= 0) {
      // free purchasable (claim)
      if (!user.badges.includes(badge._id)) user.badges.push(badge._id);
      await user.save();
      return res.json({ message: `Claimed ${badge.name}`, badge, coins: user.coins, badges: user.badges });
    }

    if (user.coins < badge.coinCost) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    // Deduct and assign
    user.coins -= badge.coinCost;
    if (!user.badges.includes(badge._id)) {
      user.badges.push(badge._id);
    }
    await user.save();

    res.json({
      message: `Unlocked badge: ${badge.name}`,
      coins: user.coins,
      badges: user.badges,
      badge,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error buying badge" });
  }
};
