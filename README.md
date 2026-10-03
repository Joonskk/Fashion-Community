## 📌 Project Overview
A full-stack social media platform for fashion enthusiasts to share outfits, discover style trends, and experience AI-powered visual recommendations.

## ✨ Key Features
🤖 AI Vision Automatic Tagging: Integrates OpenAI Vision API to analyze uploaded outfit photos instantly upon creation, automatically categorizing structured metadata (styles, garments, season, gender, and color palettes).

🔍 Smart Outfit Search Engine: Features dynamic keyword and tag-based filtering, allowing users to search posts by specific aesthetic styles, items, or seasonal categories.


🎯 Content-Based Similarity Engine: Implemented a similarity algorithm (SimilarPosts) querying overlapping visual tags to dynamically render relevant outfit recommendations on post views.

🏷️ Automated Hashtag Generation: Utilizes GPT-4 Turbo to generate context-aware, trending hashtags from visual input and post captions.

💬 Interactive Social Features: Complete social ecosystem supporting post carousels, likes, bookmarks, user follow networks, and nested comments with edit/delete permissions.

🔒 Auth & Route Guarding: Secure authentication via NextAuth.js / Google OAuth paired with smart route protection for restricted user actions.

⚡ Optimized Cloud Pipeline: Integrated Cloudinary API with automated sync workflows for instant image upload and database-storage garbage collection on post deletion.

## 🗄️ Database Schema (MongoDB)
Designed a scalable document model across 4 primary collections:


User: Profiles, physical attributes (height/weight), social graph (followers/following), and auth metadata.

Post: Image assets, captions, and structured AI tags (styles, items, season, gender, colors, hashtags).

Comments: Threaded user discussions linked to specific post instances.

Bookmark: Relational tracking for user-saved posts.

## 🛠️ Tech Stack
Framework: Next.js Fullstack (App Router, React 19, TypeScript)

AI & ML: OpenAI API (GPT-5.4-luna & Text Generation)

Database: MongoDB / Atlas

Authentication: Google Auth / NextAuth.js

Media Pipeline: Cloudinary API

Styling & UI: Tailwind CSS, Lucide Icons