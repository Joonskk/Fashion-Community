# CLAUDE.md

Context for AI coding assistants working in this repo. The README covers features, architecture and design decisions. This file covers how to work in the code.

## Project

Wearly is a fashion community app: users post outfit photos, an OpenAI vision model tags them, and feeds, search and similar posts are built on those tags. Next.js (App Router) + TypeScript + MongoDB Atlas, deployed on Vercel. The project is in maintenance mode: bug fixes and keeping CI green, no new features unless asked.

## Commands

```bash
npm run dev                          # local dev server (needs .env.local, see README)
npx tsc --noEmit && npm run lint && npm test   # what CI runs; all must pass before a PR
npm test -- similar                  # run one test file by name
docker compose up -d mongo           # local MongoDB on localhost:27017
```

Use `npx tsc`, not a global `tsc`. In zsh, quote paths with brackets: `"app/api/post/[id]/similar/route.ts"`.

## Layout

- `app/api/**/route.ts`: API routes. The database is `wearly`, collections `posts`, `users`, `comments`, `bookmarks`.
- `lib/constants.ts`: AI model name, allowed tag lists (`ALLOWED_STYLES`, `ALLOWED_ITEMS`, ...), tagging job settings.
- `lib/tagging.ts` (OpenAI call) and `lib/taggingJob.ts` (claim, retry, backoff).
- `lib/feed.ts`: cursor pagination and feed projections.
- `lib/mongodb.ts`: `getClient()` connects lazily on first call.
- `lib/session.ts`: `getSessionEmail()`.
- `scripts/`: `seed-posts.mjs` (local only) and `create-indexes.mjs`.
- `__tests__/api`, `__tests__/lib`: Jest tests. `test-utils/db.ts` starts an in-memory MongoDB.

## Rules

- **Identity comes from the session.** Use `getSessionEmail()`; never trust an email or user id from the request body or URL. Return 401 when logged out and 403 when not the owner. Bookmarks, comments and follow still need this fix (#7).
- **AI tags must be in the allowed lists** in `lib/constants.ts`. Don't add free-form tags.
- **Never call OpenAI in the request path.** New posts are saved with `aiStatus: "pending"` and tagged by `runTaggingJob` after the response. Keep the claim atomic (one `findOneAndUpdate`).
- **Project only the fields the page uses** in list endpoints (see `FEED_PROJECTION`). Don't return whole post documents.
- **Feeds use cursor pagination**, not `skip()`. A new sort or filter needs a matching compound index in `scripts/create-indexes.mjs`.
- **Escape user input before `$regex`** with `lib/escapeRegex.ts`.
- **Tests:** every API change gets a Jest test that calls the route handler directly. Mock `openai` and the NextAuth session with `jest.mock`; never hit real services. Prefer writing a failing test first for bugs.
- **Never commit secrets** or `.env*` files. Seed scripts must never point at Atlas.
- **Never claim users or scale** that don't exist in docs or PRs. Benchmarks are on seeded local data and must say so.

## Workflow

`main` is protected: work on a branch, open a PR, and both CI checks (`check`, `docker`) must pass. Keep PRs small and describe what was wrong, what changed and how it was tested.
