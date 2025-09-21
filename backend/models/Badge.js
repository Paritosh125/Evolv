import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["starter", "milestone", "special", "purchasable"],
            default: "starter",
        },
        description: { type: String, required: true },
        condition: { type: String, default: "" }, // e.g. "Complete 5 habits"
        emoji: { type: String, default: "🏅" }, // NEW: emoji representation
        xpReward: { type: Number, default: 0 },
        coinReward: { type: Number, default: 0 },
        coinCost: { type: Number, default: 0 }, // >0 only for purchasable
    },
    { timestamps: true }
);

const Badge = mongoose.model("Badge", badgeSchema);
export default Badge;
