// utils/badgeUtils.js
import Badge from "../models/Badge.js";

/**
 * Check and unlock badges based on user stats
 */
export const checkAndUnlockBadges = async (user) => {
    let unlockedBadges = [];

    // Fetch all badges
    const badges = await Badge.find();

    for (const badge of badges) {
        // Already has this badge?
        if (user.badges.includes(badge._id)) continue;

        let unlock = false;

        switch (badge.type) {
            case "starter":
                if (badge.condition === "First Habit Completed" && user.xp >= 10) {
                    unlock = true;
                }
                break;

            case "milestone":
                if (badge.condition === "Complete 5 Habits" && user.xp >= 50) {
                    unlock = true;
                }
                if (badge.condition === "Complete 10 Habits" && user.xp >= 100) {
                    unlock = true;
                }
                break;

            case "special":
                if (badge.condition === "Reach Level 5" && user.level >= 5) {
                    unlock = true;
                }
                break;

            default:
                break;
        }

        if (unlock) {
            user.badges.push(badge._id);
            user.xp += badge.xpReward || 0;
            user.coins += badge.coinReward || 0;
            unlockedBadges.push(badge);
        }
    }

    if (unlockedBadges.length > 0) {
        await user.save();
    }

    return unlockedBadges;
};
