import express from "express";
import { addHabit, getHabits, completeHabit, deleteHabit } from "../controllers/habitController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addHabit);
router.get("/", protect, getHabits);
router.put("/:id/complete", protect, completeHabit);
router.delete("/:id", protect, deleteHabit);

export default router;
