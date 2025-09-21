import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import coinRoutes from "./routes/coinRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
// ✅ CORS Fix
app.use(
    cors()
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

//for testing
app.get("/api/test", protect, (req, res) => {
    res.json({ message: `Hello ${req.user.name}, you are authorized!` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
