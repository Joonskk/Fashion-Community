import { ObjectId } from "mongodb";
import type { Db } from "mongodb";
import { startTestDb } from "@/test-utils/db";

// First run downloads a MongoDB binary, so allow more than Jest's 5s default.
jest.setTimeout(60_000);

let db: Db;
let stop: () => Promise<void>;
let GET: typeof import("@/app/api/post/search/route").GET;

const streetId = new ObjectId();
const minimalId = new ObjectId();
const casualId = new ObjectId();

beforeAll(async () => {
    ({ db, stop } = await startTestDb());

    ({ GET } = await import("@/app/api/post/search/route"));
    
    await db.collection('posts').insertMany([
        { _id: streetId, styles: ["streetwear"], items: ["jacket", "cap", "sneakers"], colors: ["white", "black", "red"], season: "summer", gender: "menswear", description: "Cozy sunny Weather", createdAt: new Date("2026-01-01") },
        { _id: minimalId, styles: ["minimalist"], items: ["coat", "jeans", "bag"], colors: ["navy", "cream"], season: "winter", gender: "womenswear", description: "Black Jacket in Winter", createdAt: new Date("2026-01-02") },
        { _id: casualId, styles: ["casual"], items: ["hoodie", "beanie"], colors: ["off-white", "gray"], season: "spring", gender: "menswear", description: "At the Cafe (sunny)", createdAt: new Date("2026-01-03") },
    ]);
});

afterAll(() => stop());

describe("GET api/post/search", () => {
    test("filters by style", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?styles=streetwear"));
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).toContain(streetId.toString());
        expect(ids).not.toContain(minimalId.toString());
        expect(ids).not.toContain(casualId.toString());
        expect(body.pagination.total).toBe(1);
    });

    test("filters by season", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?season=summer"));
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).toContain(streetId.toString());
        expect(ids).not.toContain(minimalId.toString());
        expect(ids).not.toContain(casualId.toString());
        expect(body.pagination.total).toBe(1);
    });

    test("q matches across fields, ignoring case", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?q=jacket"));
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).toContain(streetId.toString());
        expect(ids).toContain(minimalId.toString());
        expect(ids).not.toContain(casualId.toString());
        expect(body.pagination.total).toBe(2);
    });

    test("filters by color", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?colors=black"));
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).toContain(streetId.toString());
        expect(ids).not.toContain(minimalId.toString());
        expect(ids).not.toContain(casualId.toString());
        expect(body.pagination.total).toBe(1);
    });

    test("filters by gender", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?gender=menswear"));
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).toContain(streetId.toString());
        expect(ids).not.toContain(minimalId.toString());
        expect(ids).toContain(casualId.toString());
        expect(body.pagination.total).toBe(2);
    });

    test("combines filters with AND", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?styles=streetwear&season=winter"));
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).not.toContain(streetId.toString());
        expect(ids).not.toContain(minimalId.toString());
        expect(ids).not.toContain(casualId.toString());
        expect(body.pagination.total).toBe(0);
    });

    test("limit splits results into pages", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?limit=1&page=1"));
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(body.posts).toHaveLength(1);
        expect(body.pagination.totalPages).toBe(3);
        expect(ids).toContain(casualId.toString());
    });

    test("q treats parentheses as literal text", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?q=(sunny)"));
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).not.toContain(streetId.toString());
        expect(ids).not.toContain(minimalId.toString());
        expect(ids).toContain(casualId.toString());
        expect(body.pagination.total).toBe(1);
    });
    
    test("q with a lone", async () => {
        const res = await GET(new Request("http://localhost/api/post/search?q=("));
        expect(res.status).toBe(200);
    });
})