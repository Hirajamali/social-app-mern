import express from "express";
import { getUserProfile, toggleFollow, updateProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", getUserProfile);
router.post("/:id/follow", authMiddleware, toggleFollow);
router.put("/profile", authMiddleware, updateProfile);

export default router;