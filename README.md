## 📌 Project Overview
Wearly is a full-stack social media platform tailored for fashion enthusiasts to share outfits, interact with posts, and explore style trends. It incorporates secure authentication, robust database schema design, and optimized cloud media management.

## ✨ Key Features
Secure Authentication: Integrated Google OAuth for seamless login experiences.

Route Protection & Authorization: Implemented smart guards that redirect unauthenticated users to the login page when attempting restricted actions (e.g., liking posts, commenting, accessing the My Page).

AI-Powered Hashtag Recommendation: Integrated the OpenAI GPT-4 Turbo API into the backend architecture to automatically analyze uploaded outfit images/content and generate relevant, trending hashtags upon post creation.

Interactive Social Engagement: Supports core social features including post creation, liking, bookmarking, and commenting.

Optimized Cloud Media Pipeline: Integrated Cloudinary for image storage. Designed a robust backend API to handle immediate asset synchronization (automatic addition and deletion on Cloudinary upon post creation/deletion), prioritizing storage efficiency and media performance.

## 🗄️ Database Schema (MongoDB)
Designed a scalable schema structure containing 4 primary collections:

User: Manages user profiles and authentication data.

Post: Stores outfit images, captions, and references to authors.

Comments: Tracks user comments and discussion threads on posts.

Bookmark: Handles saved posts for individual users.

## 🛠️ Tech Stack
Frontend / Backend: Next.js Fullstack

Database: MongoDB

Authentication: Google Auth / NextAuth.js

AI Integration: OpenAI GPT-4 Turbo API

Media Storage: Cloudinary API