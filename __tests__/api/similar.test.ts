import { MongoMemoryServer } from "mongodb-memory-server";
import { ObjectId } from "mongodb";

// First run downloads a MongoDB binary, so allow more than Jest's 5s default.
jest.setTimeout(60_000);

let mongod: MongoMemoryServer;
let GET: typeof import("@/app/api/post/[id]/similar/route").GET;
let clientPromise: typeof import("@/lib/mongodb").default;

const currentId = new ObjectId();
const similarId = new ObjectId();
const unrelatedId = new ObjectId();

beforeAll(async () => {
    // 1. Start a fresh MongoDB that lives only while the tests run.
    mongod = await MongoMemoryServer.create();

    // 2. Point the app at it BEFORE importing anything that touches the DB.
    //    lib/mongodb.ts reads MONGODB_URI and connects the moment it is imported.
    process.env.MONGODB_URI = mongod.getUri();

    // 3. Import only now. A normal top-of-file import would run before connecting to db.
    ({ GET } = await import("@/app/api/post/[id]/similar/route"));
    clientPromise = (await import("@/lib/mongodb")).default;

    const db = (await clientPromise).db('wearly');
    await db.collection('posts').insertMany([
        { _id: currentId, styles: ["streetwear"], items: ["jeans", "sneakers"], colors: ["white", "black", "red"], season: "summer", createdAt: new Date() },
        { _id: similarId, styles: ["streetwear"], items: ["shirt", "cap", "bag"], colors: ["navy", "cream"], season: "winter", createdAt: new Date() },
        { _id: unrelatedId, styles: ["casual", "chic"], items: ["shirt", "shorts"], colors: ["off-white", "gray"], season: "spring", createdAt: new Date() },
    ]);
});

afterAll(async () => {
    await (await clientPromise).close(); // close the app's connection
    await mongod.stop();                 // shut down the throwaway DB
});

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
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).toContain(similarId.toString());
    });

    test("does not include the current post itself", async () => {
        const res = await GET(new Request("http://localhost"), {
            params: Promise.resolve({ id: currentId.toString() }),
        });
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).not.toContain(currentId.toString());
    });

    test("does not return the unrelated post", async () => {
        const res = await GET(new Request("http://localhost"), {
            params: Promise.resolve({ id: currentId.toString() }),
        });
        const body = await res.json();
        const ids = body.posts.map((p: any) => p._id);
        expect(ids).not.toContain(unrelatedId.toString());
    });
})