# Wearly

[![CI](https://github.com/Joonskk/Fashion-Community/actions/workflows/ci.yml/badge.svg)](https://github.com/Joonskk/Fashion-Community/actions/workflows/ci.yml)

A full-stack fashion community app where people share outfits, search by style, and get similar-outfit recommendations. Uploaded outfit photos are tagged automatically by an OpenAI vision model.

## Features

- **AI vision tagging:** when a post is created, an OpenAI vision model (`gpt-5.6-luna`) reads the photo and returns structured tags: styles, items, season, gender and colors. Every tag is filtered against a fixed allowed list in `lib/constants.ts`, so the model can't invent new categories.
- **Style tags from three sources:** the styles a user picks, `#hashtags` written in the caption, and the AI's styles are merged, filtered to the allowed list, de-duplicated and capped at 3.
- **Search:** keyword search over captions plus filters for style, item, color, season and gender, with pagination. User input is regex-escaped before it reaches MongoDB.
- **Similar outfits:** each post page shows posts that share items, styles, colors or season with it.
- **Social:** image carousels, likes, bookmarks, follows and comments with edit and delete.
- **Auth:** Google sign-in with NextAuth.js.
- **Images:** uploads go to Cloudinary, and a post's images are removed from Cloudinary when the post is deleted.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js (App Router), React 19, TypeScript |
| Database | MongoDB Atlas |
| AI | OpenAI API (vision model with structured JSON output) |
| Auth | NextAuth.js, Google OAuth |
| Media | Cloudinary |
| UI | Tailwind CSS, Lucide icons |
| Testing | Jest, mongodb-memory-server |
| Containers | Docker (multi-stage build), Docker Compose |
| CI | GitHub Actions |

## Data model (MongoDB)

- **users:** profile, height and weight, followers and following
- **posts:** images, caption, likes, and AI tags (`styles`, `items`, `season`, `gender`, `colors`)
- **comments:** linked to a post
- **bookmarks:** which user saved which post

## Getting started

Requirements: Node.js 20+, and accounts for MongoDB Atlas, Google OAuth, Cloudinary and OpenAI.

```bash
git clone https://github.com/Joonskk/Fashion-Community.git
cd Fashion-Community
npm install
```

Create `.env.local` in the project root:

```bash
MONGODB_URI=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
```

Then run `npm run dev` and open http://localhost:3000.

## Run with Docker

Requirements: Docker Desktop and the same `.env.local` as above. No Node.js install is needed.

```bash
docker compose --env-file .env.local up --build
```

Then open http://localhost:3000.

- Compose starts two containers: the app and a local MongoDB (`mongo:7`). The app's `MONGODB_URI` is overridden to point at the local database, so it starts empty and never touches Atlas.
- `--env-file .env.local` passes the two `NEXT_PUBLIC_CLOUDINARY_*` values to the build, because Next.js bakes `NEXT_PUBLIC_*` variables into the browser bundle at build time. All other secrets are read from `.env.local` when the container starts and are never stored in the image (`.dockerignore` excludes `.env*`).
- Stop with `Ctrl+C`, then `docker compose down`. Local data is kept in the `mongo-data` volume; `docker compose down -v` deletes it.

To run only the app image against your own database (for example Atlas):

```bash
docker build -t wearly \
  --build-arg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<value> \
  --build-arg NEXT_PUBLIC_CLOUDINARY_API_KEY=<value> .
docker run --rm --env-file .env.local -p 3000:3000 wearly
```

How the image is built (`Dockerfile`):

| Stage | What it does |
| --- | --- |
| `deps` | Installs dependencies with `npm ci`. Only `package*.json` is copied first, so this layer is cached until dependencies change. |
| `builder` | Copies the source and runs `npm run build` with Next.js `output: "standalone"`. |
| `runner` | Copies only the standalone server, `.next/static` and `public`, and runs `node server.js` as the non-root `node` user. |

The final image is 346 MB on disk (86.9 MB compressed), compared with 1.34 GB for the build stage, which is roughly what a single-stage image would ship.

## Testing

```bash
npm test            # run all tests once
npm run test:watch  # re-run on file changes
```

The API tests call the Next.js route handlers directly, as plain async functions, with no dev server. Each test file starts its own throwaway in-memory MongoDB (`mongodb-memory-server`), so the tests never touch the real database and need no `.env.local`. OpenAI and the NextAuth session are mocked with `jest.mock`, so the tests are free, fast and give the same result every run.

```
__tests__/
  api/
    similar.test.ts       # similar-outfit matching, invalid id → 400
    search.test.ts        # filters, AND across filters, case-insensitive q, pagination, regex escaping
    create-post.test.ts   # 401 (even with an email in the body), 400, AI success, AI failure fallback, style merging
    toggle-likes.test.ts  # like, unlike, multiple users, 404, invalid id → 400, 401 logged out
    delete-post.test.ts   # 401 logged out, 403 not the author, owner delete removes images
  lib/
    hashtags.test.ts      # caption hashtag extraction
    escapeRegex.test.ts   # special characters are escaped
test-utils/
  db.ts                   # shared helper: start in-memory MongoDB, return { db, stop }
```

The tests found two bugs that are now fixed: a search for `(` crashed the search route with a 500 because the query went straight into `$regex`, and an invalid post id crashed the like route.

## Continuous integration

Every pull request into `main`, and every push to `main`, runs `.github/workflows/ci.yml` on GitHub Actions. It has two jobs that run in parallel:

| Job | What it runs | Time |
| --- | --- | --- |
| `check` | `npm ci` → `npx tsc --noEmit` → `npm run lint` → `npm test` | ~33 s (npm cache) |
| `docker` | `docker build`, to make sure the image still builds | ~1 min |

Neither job needs secrets: the tests use an in-memory MongoDB, and the build no longer connects to a database.

A ruleset on `main` requires a pull request and both checks to pass before merging, with no bypass. To confirm it works, a test was broken on purpose in #10: `check` failed and merging was blocked.

To run the same checks locally before pushing:

```bash
npx tsc --noEmit && npm run lint && npm test
```

## Known issues and roadmap

Known issues (tracked for upcoming work):
- When AI tagging fails, the post is saved with fallback values (`all-season`, `unisex`) that aren't in the allowed lists, so search filters can't find it. Planned fix: run tagging as a background job with a status field and retries.
- Likes, post creation and post deletion now take the user only from the session (#6). Bookmarks, comments and follow still trust an email from the request; tracked in #7.
