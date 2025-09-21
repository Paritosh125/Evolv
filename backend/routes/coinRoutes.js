// routes/coinRoutes.js
import express from "express";
import { earnCoins, spendCoins } from "../controllers/coinController.js";

const router = express.Router();

router.post("/earn", earnCoins);
router.post("/spend", spendCoins);

export default router;
