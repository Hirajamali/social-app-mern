import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [commentTexts, setCommentTexts] = useState({});
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    api
      .get("/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post("/posts", { content });
      setContent("");
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;
    try {
      await api.post(`/posts/${postId}/comment`, { text });
      setCommentTexts({ ...commentTexts, [postId]: "" });
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Social App</h1>
        <div className="flex items-center gap-4">
          {user && (
            <Link to={`/profile/${user.id}`} className="text-gray-700 hover:underline">
              My Profile
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-6 px-4">
        {/* Create Post */}
        <form onSubmit={handleCreatePost} className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Post
          </button>
        </form>

        {/* Posts List */}
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <Link
              to={`/profile/${post.author?._id}`}
              className="font-semibold text-gray-800 hover:underline"
            >
              {post.author?.username || "Unknown"}
            </Link>
            <p className="text-gray-700 mt-1">{post.content}</p>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <button onClick={() => handleLike(post._id)} className="hover:text-blue-600">
                ❤️ Like ({post.likes?.length || 0})
              </button>
              <span>💬 {post.comments?.length || 0} Comments</span>
            </div>

            {/* Comments */}
            <div className="mt-3 space-y-1">
              {post.comments?.map((c) => (
                <p key={c._id} className="text-sm text-gray-600">
                  <span className="font-medium">{c.author?.username || "User"}:</span> {c.text}
                </p>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex mt-2 gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentTexts[post._id] || ""}
                onChange={(e) =>
                  setCommentTexts({ ...commentTexts, [post._id]: e.target.value })
                }
                className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleComment(post._id)}
                className="text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                Send
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;