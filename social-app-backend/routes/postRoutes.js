import express from "express";
import { createPost, getAllPosts, toggleLike, addComment } from "../controllers/postController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", getAllPosts);
router.post("/:id/like", authMiddleware, toggleLike);
router.post("/:id/comment", authMiddleware, addComment);

export default router;