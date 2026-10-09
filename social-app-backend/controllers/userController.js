import User from "../models/User.js";
import Post from "../models/Post.js";

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: id }).sort({ createdAt: -1 });

    res.status(200).json({
      user,
      posts,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load profile", error: error.message });
  }
};

// FOLLOW / UNFOLLOW USER
export const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = currentUser.following.includes(targetUserId);

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId);
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: alreadyFollowing ? "Unfollowed" : "Followed",
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Follow action failed", error: error.message });
  }
};

// UPDATE PROFILE (bio + profile picture)
export const updateProfile = async (req, res) => {
  try {
    const { bio, profilePic } = req.body;
    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (profilePic !== undefined) updates.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");

    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};