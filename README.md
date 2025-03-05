# 🎥 YouTube Learn: Educational Video Discovery Platform

## 📌 Project Overview

YouTube Learn is a sophisticated web application that provides an enhanced video discovery and learning experience, leveraging the YouTube Data API to help users find and explore educational content seamlessly.

## ✨ Features

### 🔍 Advanced Search Functionality
- Comprehensive video search across YouTube
- Intelligent filtering options
- Keyword-based and category-based search

### 📊 Smart Recommendation System
- Personalized video suggestions
- Learning path recommendations
- Category-based content discovery

### 🔐 Secure Authentication
- Google OAuth integration
- Seamless user authentication
- Secure session management

### 💾 User-Centric Experience
- Save favorite videos
- Create custom playlists
- Track learning progress

## 🛠 Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS

### Backend
- Prisma ORM
- NextAuth.js
- PostgreSQL

### Authentication
- Google OAuth
- JWT-based authentication

### External APIs
- YouTube Data API v3

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Google Cloud Console Account
- PostgreSQL Database

### Installation Steps
1. Clone the repository
   ```bash
   git clone https://github.com/Aditya-galaxy/YouTubeLearn.git
   ```

2. Install dependencies
   ```bash
   cd youtubelearn
   npm install
   ```

3. Set up environment variables
   - Create `.env` file
   - Add necessary configurations:
     ```
     GOOGLE_CLIENT_ID=
     GOOGLE_CLIENT_SECRET=
     NEXTAUTH_SECRET=
     DATABASE_URL=
     NEXT_PUBLIC_API_URL=
     YOUTUBE_API_KEY=
     DIRECT URL=
     NEXTAUTH_URL=
     NEXT_PUBLIC_MAX_SEARCH_RESULTS=
     NEXT_PUBLIC_CACHE_DURATION=
     ```

4. Initialize database
   ```bash
   npx prisma migrate dev
   ```

5. Run development server
   ```bash
   npm run dev
   ```

## 🔒 Environment Variables

- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `NEXTAUTH_SECRET`: NextAuth encryption key
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_API_URL`: Application base URL
- `YOUTUBE_API_KEY`: YouTube Data API Key
- `DIRECT URL`: Database quick transfers
- `NEXTAUTH_URL`: Application base URL
- `NEXT_PUBLIC_MAX_SEARCH_RESULTS`: Max results
- `NEXT_PUBLIC_CACHE_DURATION`: Cache Retention Duration

## 📦 Key Dependencies

- `next-auth`: Authentication
- `@prisma/client`: Database ORM
- `@next-auth/prisma-adapter`: Prisma adapter for NextAuth
- `youtube-api-v3`: YouTube API interactions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to the branch
5. Create pull request

## 📄 License

This project is licensed under my License.

## 🛟 Support

For issues or questions, please open a GitHub issue or contact me .

## 📊 Project Status

![Static Badge](https://img.shields.io/badge/version-1.0.0-blue)
![Static Badge](https://img.shields.io/badge/status-active-green)
![Static Badge](https://img.shields.io/badge/build-passing-brightgreen)
