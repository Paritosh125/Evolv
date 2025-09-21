import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getBadges, buyBadge } from "../controllers/badgeController.js";

const router = express.Router();

router.get("/", protect, getBadges);        // List all badges
router.post("/buy/:badgeId", protect, buyBadge); // Buy badge

export default router;
