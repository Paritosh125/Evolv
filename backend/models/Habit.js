import mongoose from "mongoose";

const habitSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
        estimatedTime: { type: Number, default: 0 }, // minutes (user input)
        description: { type: String, default: "" },
        completedCount: { type: Number, default: 0 },
        lastCompleted: { type: Date },
        streak: { type: Number, default: 0 },
        difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },

    },
    { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
