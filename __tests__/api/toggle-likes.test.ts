import { ObjectId } from "mongodb";
import type { Db } from "mongodb";
import { startTestDb } from "@/test-utils/db";

// First run downloads a MongoDB binary, so allow more than Jest's 5s default.
jest.setTimeout(60_000);

let db: Db;
let stop: () => Promise<void>;
let POST: typeof import("@/app/api/post/toggle-likes/route").POST;

const postId = new ObjectId();

beforeAll(async () => {
    ({ db, stop } = await startTestDb());

    ({ POST } = await import("@/app/api/post/toggle-likes/route"));
});

afterAll(() => stop());

beforeEach(async () => {
    await db.collection("posts").deleteMany({});
    await db.collection("posts").insertOne({ _id: postId, likes: [], likesCount: 0 });
});

function like(email: string, id: string = postId.toString()) {
    return POST(new Request("http://localhost/api/post/toggle-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, userEmail: email }),
    }));
}

describe("POST /api/post/toggle-likes", () => {
    test("first like adds the user and sets likesCount to 1", async () => {
        const res = await like("a@test.com");
        const body = await res.json();
    
        expect(body).toEqual({ liked: true, likesCount: 1 });
    
        const saved = await db.collection("posts").findOne({ _id: postId });
        expect(saved?.likes).toEqual(["a@test.com"]);
    });

    test("liking twice un-likes and resets likesCount to 0", async () => {
        const res = await like("a@test.com");
        const body = await res.json();
    
        expect(body).toEqual({ liked: true, likesCount: 1 });

        const res2 = await like("a@test.com");
        const body2 = await res2.json();

        expect(body2).toEqual({ liked: false, likesCount: 0 });
    
        const saved = await db.collection("posts").findOne({ _id: postId });
        expect(saved?.likes).toEqual([]);
    });

    test("two users' likes sets likesCount to 2", async () => {
        const res = await like("a@test.com");
        const body = await res.json();
    
        expect(body).toEqual({ liked: true, likesCount: 1 });

        const res2 = await like("b@test.com");
        const body2 = await res2.json();

        expect(body2).toEqual({ liked: true, likesCount: 2 });
    
        const saved = await db.collection("posts").findOne({ _id: postId });
        expect(saved?.likes).toEqual(["a@test.com", "b@test.com"]);
        expect(saved?.likesCount).toBe(2);
    });

    test("liking a non-existing post returns 404", async () => {
        const missingId = new ObjectId().toString();

        const res = await like("a@test.com", missingId);
    
        expect(res.status).toBe(404);
    
        const saved = await db.collection("posts").findOne({ _id: postId });
        expect(saved?.likes).toEqual([]);
        expect(saved?.likesCount).toBe(0);
    });

    test("invalid post id returns 400", async () => {
        const res = await like("a@test.com", "abc");
    
        expect(res.status).toBe(400);
    
        const saved = await db.collection("posts").findOne({ _id: postId });
        expect(saved?.likes).toEqual([]);
        expect(saved?.likesCount).toBe(0);
    });
});