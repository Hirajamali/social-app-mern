import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    const newPost = new Post({
      author: req.userId,
      content,
      image: image || "",
    });

    await newPost.save();

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

// GET ALL POSTS
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to load posts", error: error.message });
  }
};

// LIKE / UNLIKE POST
export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Like removed" : "Post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Like action failed", error: error.message });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({
      author: req.userId,
      post: postId,
      text,
    });

    await newComment.save();

    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};