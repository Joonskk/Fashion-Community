import { ObjectId } from "mongodb";
import type { Db } from "mongodb";
import { startTestDb } from "@/test-utils/db";

// First run downloads a MongoDB binary, so allow more than Jest's 5s default.
jest.setTimeout(60_000);

let db: Db;
let stop: () => Promise<void>;
let GET: typeof import("@/app/api/post/[id]/similar/route").GET;

const currentId = new ObjectId();
const similarId = new ObjectId();
const unrelatedId = new ObjectId();

beforeAll(async () => {
    ({ db, stop } = await startTestDb());

    ({ GET } = await import("@/app/api/post/[id]/similar/route"));
    
    await db.collection('posts').insertMany([
        { _id: currentId, styles: ["streetwear"], items: ["jeans", "sneakers"], colors: ["white", "black", "red"], season: "summer", createdAt: new Date() },
        { _id: similarId, styles: ["streetwear"], items: ["shirt", "cap", "bag"], colors: ["navy", "cream"], season: "winter", createdAt: new Date() },
        { _id: unrelatedId, styles: ["casual", "chic"], items: ["shirt", "shorts"], colors: ["off-white", "gray"], season: "spring", createdAt: new Date() },
    ]);
});

afterAll(() => stop());

describe("GET /api/post/[id]/similar", () => {
    // invalid id
    test("returns 400 for an invalid id", async () => {
        const res = await GET(new Request("http://localhost"), {
            params: Promise.resolve({ id: "not-an-id" }),
        });
        expect(res.status).toBe(400);
    });

    test("returns the post that shares a style", async () => {
        const res = await GET(new Request("http://localhost"), {
            params: Promise.resolve({ id: currentId.toString() }),
        });
        const body = await res.json();
        const ids = body.posts.map((p: { _id: string }) => p._id);
        expect(ids).toContain(similarId.toString());
    });

    test("does not include the current post itself", async () => {
        const res = await GET(new Request("http://localhost"), {
            params: Promise.resolve({ id: currentId.toString() }),
        });
        const body = await res.json();
        const ids = body.posts.map((p: { _id: string }) => p._id);
        expect(ids).not.toContain(currentId.toString());
    });

    test("does not return the unrelated post", async () => {
        const res = await GET(new Request("http://localhost"), {
            params: Promise.resolve({ id: currentId.toString() }),
        });
        const body = await res.json();
        const ids = body.posts.map((p: { _id: string }) => p._id);
        expect(ids).not.toContain(unrelatedId.toString());
    });
})