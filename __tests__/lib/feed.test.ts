import { ObjectId, type Db, type Document } from "mongodb";
import { startTestDb } from "@/test-utils/db";
import { getFeedPage, decodeCursor, PAGE_SIZE, type Cursor, type SortMode } from "@/lib/feed";

jest.setTimeout(60_000);

let db: Db;
let stop: () => Promise<void>;

beforeAll(async () => { ({ db, stop } = await startTestDb()); });
afterAll(() => stop());
beforeEach(async () => { await db.collection("posts").deleteMany({}); });

const TOTAL = 45; // not a multiple of PAGE_SIZE, so the last page is short

async function seed() {
    const sameTime = new Date("2026-01-01T00:00:00Z");
    const docs = Array.from({ length: TOTAL }, (_, i) => ({
        _id: new ObjectId(),
        userEmail: `u${i % 3}@test.local`,
        sex: i % 2 ? "male" : "female",
        images: [{ public_id: "t", url: `https://example.com/${i}.jpg` }],
        likes: [],
        likesCount: i % 5, // lots of ties for the likes sort too
        // first 30 posts share ONE timestamp, the rest are 1 s apart
        createdAt: i < 30 ? sameTime : new Date(sameTime.getTime() + i * 1000),
    }));
    await db.collection("posts").insertMany(docs);
}

// Follow nextCursor until it runs out; return every id in the order we got them
async function walk(mode: SortMode, filter: Document = {}) {
    const ids: string[] = [];
    let cursor: Cursor | null = null;
    let pages = 0;
    do {
        const page = await getFeedPage(db, mode, filter, cursor);
        ids.push(...page.posts.map((p) => p._id.toString()));
        cursor = page.nextCursor ? decodeCursor(page.nextCursor) : null;   // BLANK 1
        pages++;
    } while (cursor);
    return { ids, pages };
}

test("newest: walks every post once, in order, across ties", async () => {
    await seed();
    const { ids, pages } = await walk("newest");

    // the "truth": the whole collection sorted the same way, no paging
    const expected = (await db.collection("posts")
        .find().sort({ createdAt: -1, _id: -1 }).toArray())
        .map((p) => p._id.toString());

    expect(ids.length).toBe(TOTAL);
    expect(new Set(ids).size).toBe(TOTAL);
    expect(ids).toEqual(expected);
    expect(pages).toBe(Math.ceil(TOTAL / PAGE_SIZE));
});