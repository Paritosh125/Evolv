// utils/difficulty.js
// Lightweight keyword + time based difficulty classifier

const easyKeywords = [
    "water", "drink", "stretch", "brush", "smile", "bed", "hydrate", "stretch"
];
const mediumKeywords = [
    "read", "study", "meditate", "walk", "yoga", "cook", "practice", "learn"
];
const hardKeywords = [
    "workout", "gym", "run", "project", "coding", "solve", "assignment", "practice hard"
];

/**
 * Classify difficulty using:
 *  - explicit estimatedTime (minutes)
 *  - keywords in title and description
 * Returns: "easy" | "medium" | "hard"
 */
export function classifyDifficulty({ title = "", description = "", estimatedTime = 0 }) {
    const text = `${title} ${description}`.toLowerCase();

    // time-based tiers (soft)
    if (estimatedTime >= 60) return "hard";
    if (estimatedTime >= 30) return "medium";
    if (estimatedTime > 0 && estimatedTime <= 15) return "easy";

    // keyword signals (counts)
    let score = 0;
    for (const kw of easyKeywords) if (text.includes(kw)) score -= 1;
    for (const kw of mediumKeywords) if (text.includes(kw)) score += 1;
    for (const kw of hardKeywords) if (text.includes(kw)) score += 2;

    if (score <= -1) return "easy";
    if (score === 0 || score === 1) return "medium";
    return "hard";
}
