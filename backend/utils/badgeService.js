// utils/badgeService.js
import Badge from "../models/Badge.js";
import User from "../models/User.js";

/**
 * checkAndAwardBadges(userId, trigger, context)
 * - Awards milestone badges based on user's totalXpEarned and level
 * - Awards streak-based badges when trigger === 'completeHabit' and context.streak provided
 * - Skips purchasable badges (they are bought via purchase route)
 * Returns array of unlocked badge documents
 */
export const checkAndAwardBadges = async (userId, trigger, context = {}) => {
  const user = await User.findById(userId).populate("badges");
  if (!user) return [];

  const alreadyOwned = user.badges.map((b) => b._id.toString());
  const allBadges = await Badge.find();
  const unlocked = [];

  for (const badge of allBadges) {
    // skip if already owned
    if (alreadyOwned.includes(badge._id.toString())) continue;

    // skip purchasable (handled elsewhere)
    if (badge.type === "purchasable") continue;

    let meetsCondition = false;
    const cond = (badge.condition || "").toString().trim().toLowerCase();

    // --- milestone (xp) conditions ---
    // accept patterns: "20xp", "xp>=20", "xp>20", "xp:20"
    if (badge.type === "milestone") {
      if (!cond) {
        // if no condition, skip
        meetsCondition = false;
      } else {
        // extract number
        const m = cond.match(/(\d+)/);
        if (m) {
          const threshold = parseInt(m[1], 10);
          // Use totalXpEarned (cumulative) or user.xp if not present
          const userXp = Number(user.totalXpEarned || user.xp || 0);
          if (userXp >= threshold) meetsCondition = true;
        }
      }
    }

    // --- event based: streak etc. ---
    if (trigger === "completeHabit") {
      // streak conditions like "streak>=3" or "3streak" or "streak:3"
      if (cond.includes("streak")) {
        const m = cond.match(/(\d+)/);
        if (m && context.streak) {
          const req = parseInt(m[1], 10);
          if (context.streak >= req) meetsCondition = true;
        }
      }

      // category-based or other event types can be added here (e.g., category:study)
      if (cond.startsWith("category:") && context.category) {
        const want = cond.split(":")[1];
        if (want && context.category && context.category.toLowerCase() === want.toLowerCase()) {
          meetsCondition = true;
        }
      }
    }

    // --- generic conditions: level>=N ---
    if (!meetsCondition && cond.startsWith("level")) {
      const m = cond.match(/(\d+)/);
      if (m) {
        const lvl = parseInt(m[1], 10);
        if (user.level >= lvl) meetsCondition = true;
      }
    }

    if (meetsCondition) {
      user.badges.push(badge._id);
      user.xp = (user.xp || 0) + (badge.xpReward || 0);
      user.coins = (user.coins || 0) + (badge.coinReward || 0);
      unlocked.push(badge);
    }
  }

  if (unlocked.length > 0) {
    await user.save();
  }

  return unlocked;
};

