// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        xp: { type: Number, default: 0 },
        coins: { type: Number, default: 0 },
        totalCoinsEarned: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        totalXpEarned: { type: Number, default: 0 },
        // ✅ badges as array of references
        badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
