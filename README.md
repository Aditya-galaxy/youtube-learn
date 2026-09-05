# YouTube Learn

[![CI](https://github.com/Aditya-galaxy/youtube-learn/actions/workflows/ci.yml/badge.svg)](https://github.com/Aditya-galaxy/youtube-learn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)

**[Live demo →](https://youtube-learn.vercel.app)**

A video-discovery app for educational content on YouTube. Sign in with Google, browse an
Education-category feed from the YouTube Data API, search it, and keep a library, a saved
list and a watch history.

Built with Next.js 15 (App Router + a small Pages-Router API surface), React 19, TypeScript,
Tailwind, shadcn/ui, NextAuth and Prisma/PostgreSQL.

## Features

- **Google sign-in** via NextAuth with a Prisma adapter and JWT sessions.
- **Educational feed** from the YouTube Data API, filtered to the Education category and to
  videos that are embeddable, long enough to be substantive, and not obviously clickbait.
- **Search** with results driven entirely by the URL, so a result page can be shared and reloaded.
- **Infinite scroll** using YouTube page tokens.
- **Library / Saved / History**, persisted per-browser in `localStorage`.
- **Per-user rate limiting** on the API so a single account cannot burn the project's daily
  YouTube quota.
- **Light and dark themes.**
- Signed-out visitors get a local sample feed instead of an error.

## Getting started

### Prerequisites

- Node.js 18.18 or newer
- A PostgreSQL database
- A Google Cloud project with the **YouTube Data API v3** enabled and an OAuth 2.0 client

### Setup

```bash
git clone https://github.com/Aditya-galaxy/youtube-learn.git
cd youtube-learn
npm install
cp .env.example .env.local
```

Fill in `.env.local` — every variable is documented in [`.env.example`](.env.example). In the
Google Cloud console, add `http://localhost:3000/api/auth/callback/google` as an authorised
redirect URI.

Push the Prisma schema to your database:

```bash
npx prisma db push
```

Then start the dev server:

```bash
npm run dev
```

The app runs at http://localhost:3000.

### Scripts

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the development server                        |
| `npm run build`     | Generate the Prisma client and build for production |
| `npm start`         | Serve the production build                          |
| `npm run lint`      | Run ESLint                                          |
| `npm run typecheck` | Run `tsc --noEmit`                                  |

## Environment variables

| Variable                            | Required | Purpose                                            |
| ----------------------------------- | -------- | -------------------------------------------------- |
| `DATABASE_URL`                      | yes      | Pooled PostgreSQL connection used at runtime       |
| `DIRECT_URL`                        | yes      | Unpooled connection used by Prisma migrations      |
| `NEXTAUTH_URL`                      | yes      | Canonical URL of the deployment                    |
| `NEXTAUTH_SECRET`                   | yes      | Session encryption key (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID`                  | yes      | Google OAuth client ID                             |
| `GOOGLE_CLIENT_SECRET`              | yes      | Google OAuth client secret                         |
| `YOUTUBE_API_KEY`                   | yes      | Server-side YouTube Data API v3 key                |
| `NEXT_PUBLIC_BUYMEACOFFEE_USERNAME` | no       | Shows the sidebar support button when set          |

## Project structure

```
src/
  app/                 App Router pages, layout, and the /api/user-logs route
  pages/api/           NextAuth handler and the YouTube feed endpoint
  components/          UI, grouped by feature; components/ui is shadcn/ui
  Helper/Context.tsx   Client state: selected video, library, saved, history
  lib/                 auth options, Prisma client, formatters, sample feed
  config/navigation.ts Nav items shared by the sidebar and mobile sheet
prisma/schema.prisma   User, Account, Session, UserTokens, ViewedVideos
```

## API

### `GET /api/videos`

Requires a session. Returns a page of videos plus the caller's remaining hourly budget.

| Query param | Default          | Notes                                          |
| ----------- | ---------------- | ---------------------------------------------- |
| `q`         | —                | Search term; omit for the default feed         |
| `pageToken` | —                | YouTube page token for the next page           |
| `order`     | `relevance`      | `relevance`, `viewCount`, `date` or `rating`   |
| `category`  | `27` (Education) | Numeric YouTube category id                    |
| `language`  | `en`             | ISO 639-1                                      |
| `region`    | `US`             | ISO 3166-1 alpha-2                             |
| `refresh`   | —                | `true` skips recording results as already-seen |

Responses: `200`, `400` invalid params, `401` no session, `429` hourly budget exhausted,
`502` YouTube unavailable or over quota.

### `GET /api/health`

Public. Reports whether the app can reach Postgres — `200 {"status":"ok","database":"up"}`
or `503 {"status":"degraded","database":"down"}`. Sign-in is the only user-facing flow
that writes to the database, so when it is unreachable every page still renders and only
authentication fails; this tells the two apart without triggering a sign-in.

### `POST /api/user-logs`

Requires a session. Accepts `{ event, timestamp? }`. The user identity is taken from the
session, never from the request body.

## Known limitations

- Library, Saved and History live in `localStorage`, so they do not follow a user across
  devices. Moving them server-side needs new Prisma models and endpoints.
- Profile edits on `/profile` are in-memory only; there is no profile write endpoint.
- `/plans` and `/settings` are UI only — there is no payment provider and settings are not stored.
- Notifications in the navbar are placeholder content.

## License

[MIT](LICENSE) © Aditya Kumar
