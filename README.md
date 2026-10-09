📱 Full-Stack Social Media Application

A full-stack social media web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with Vite. Users can register, log in, create posts, like, comment, update their profiles, and follow other users.

✨ Features

Authentication & Authorization: Secure User Registration and Login functionality.

User Profiles: Custom profiles with bio, profile picture upload, follower/following counts, and personal posts history.

Feed & Posts: Create new posts, like posts, and leave comments in real-time.

Follow System: Ability to follow/unfollow other users.

Responsive Design: Clean and modern UI built for various screen sizes.

🛠️ Tech Stack

Frontend

React (Vite)

CSS / Modern UI Components

Axios (API Calls)

Backend

Node.js & Express.js

MongoDB (Database)

JWT (JSON Web Tokens for Auth)

📂 Project Structure

social-app/
├── social-app-backend/     # Express & Node.js Server
│   ├── controllers/         # Logic for auth, post, and user operations
│   ├── middleware/          # Auth verification middleware
│   ├── models/              # Mongoose database schemas (User, Post, Comment)
│   ├── routes/              # Express API endpoints
│   ├── .env                 # Environment variables
│   └── server.js            # Entry point for backend
│
└── social-app-frontend/    # React Frontend App (Vite)
    ├── src/
    │   ├── pages/           # Signup, Login, Feed, Profile components
    │   └── api.js           # Axios configuration
    └── package.json