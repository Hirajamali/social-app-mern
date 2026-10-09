import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

// Picture ko 200px tak chhota karta hai taake database me halki save ho
const resizeImage = (file, maxSize = 200) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

function Avatar({ src, name, size = "w-24 h-24", text = "text-3xl" }) {
  if (src) {
    return <img src={src} alt={name} className={`${size} rounded-full object-cover`} />;
  }
  return (
    <div
      className={`${size} ${text} rounded-full bg-blue-600 text-white flex items-center justify-center font-bold`}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

function Profile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [bioText, setBioText] = useState("");
  const [picData, setPicData] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isOwnProfile = currentUser && currentUser.id === id;

  const applyData = (d) => {
    setData(d);
    setBioText(d.user.bio || "");
    setPicData(d.user.profilePic || "");
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      applyData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then((res) => applyData(res.data))
      .catch((err) => {
        console.log(err);
        setError(err.response?.data?.message || err.message);
      });
    
  }, [id]);

  const handleFollow = async () => {
    try {
      await api.post(`/users/${id}/follow`);
      refreshProfile();
    } catch (err) {
      console.log(err);
    }
  };

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const resized = await resizeImage(file);
    setPicData(resized);
  };

  const handleSave = async () => {
    try {
      await api.put("/users/profile", { bio: bioText, profilePic: picData });
      setEditing(false);
      refreshProfile();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setBioText(data.user.bio || "");
    setPicData(data.user.profilePic || "");
  };

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Could not load profile: {error}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Feed
        </Link>
      </div>

      <div className="max-w-xl mx-auto mt-6 px-4">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={editing ? picData : data.user.profilePic}
              name={data.user.username}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{data.user.username}</h2>
              <p className="text-gray-500 text-sm">{data.user.email}</p>
              <div className="flex gap-4 mt-1 text-sm text-gray-600">
                <span>
                  <b>{data.followersCount}</b> Followers
                </span>
                <span>
                  <b>{data.followingCount}</b> Following
                </span>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="mt-4">
              <label className="block text-sm text-gray-600 mb-1">Profile picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePicChange}
                className="text-sm mb-3"
              />
              <label className="block text-sm text-gray-600 mb-1">Bio</label>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Tell people about yourself..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 px-4 py-1 rounded-md text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mt-4">{data.user.bio || "No bio yet"}</p>

              {isOwnProfile && (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-3 bg-gray-200 px-4 py-1 rounded-md hover:bg-gray-300 text-sm"
                >
                  Edit Profile
                </button>
              )}

              {!isOwnProfile && currentUser && (
                <button
                  onClick={handleFollow}
                  className="mt-3 bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 text-sm"
                >
                  Follow / Unfollow
                </button>
              )}
            </>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2 text-gray-800">Posts</h3>
        {data.posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}
        {data.posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-lg shadow-sm mb-3">
            <p className="text-gray-700">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;