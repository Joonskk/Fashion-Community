# Wearly

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
    create-post.test.ts   # 401 / 400 guards, AI success, AI failure fallback, style merging
    toggle-likes.test.ts  # like, unlike, multiple users, 404, invalid id → 400
  lib/
    hashtags.test.ts      # caption hashtag extraction
    escapeRegex.test.ts   # special characters are escaped
test-utils/
  db.ts                   # shared helper: start in-memory MongoDB, return { db, stop }
```

The tests found two bugs that are now fixed: a search for `(` crashed the search route with a 500 because the query went straight into `$regex`, and an invalid post id crashed the like route.

## Known issues and roadmap

Known issues (found by the tests, tracked for upcoming work):
- When AI tagging fails, the post is saved with fallback values (`all-season`, `unisex`) that aren't in the allowed lists, so search filters can't find it. Planned fix: run tagging as a background job with a status field and retries.
- Some routes take the user's email from the request body and don't require a session. Planned fix: take identity only from the session.

Roadmap:
- [x] Jest API tests
- [ ] Docker
- [ ] GitHub Actions CI
- [ ] AI tagging as a background job with retries
- [ ] Cursor pagination and MongoDB indexes
- [ ] Vector search for similar outfits, measured against tag matching
- [ ] Load test with k6