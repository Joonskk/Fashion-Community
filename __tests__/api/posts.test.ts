// Fake login: each test decides who is signed in
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
import { getServerSession } from "next-auth";
const mockSession = getServerSession as jest.Mock;

import type { Db } from "mongodb";
import type { NextRequest } from "next/server";
import { startTestDb } from "@/test-utils/db";

jest.setTimeout(60_000);

let db: Db;
let stop: () => Promise<void>;
let GET: typeof import("@/app/api/posts/route").GET;

beforeAll(async () => {
    ({ db, stop } = await startTestDb());
    ({ GET } = await import("@/app/api/posts/route"));
});
afterAll(() => stop());
beforeEach(async () => {
    await db.collection("posts").deleteMany({});
    await db.collection("users").deleteMany({});
});

// Call the route like the browser would: GET /api/posts?<query>
function getPosts(query: string, email: string | null = null) {
    mockSession.mockResolvedValue(email ? { user: { email } } : null);
    return GET(new Request(`http://localhost/api/posts?${query}`) as NextRequest);
}

test("garbage cursor -> 400", async () => {
    const res = await getPosts("sort=newest&cursor=null");
    expect(res.status).toBe(400);
});

test("following feed when logged out -> 401", async () => {
    const res = await getPosts("sort=following", null);
    expect(res.status).toBe(401);
});

test("following feed only shows people I follow", async () => {
    await db.collection("users").insertOne({ email: "me@test.local", following: ["friend@test.local"] });
    await db.collection("posts").insertMany([
        { userEmail: "friend@test.local", createdAt: new Date(), likesCount: 0 },
        { userEmail: "stranger@test.local", createdAt: new Date(), likesCount: 0 },
    ]);

    const res = await getPosts("sort=following", "me@test.local");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.posts.map((p: { userEmail: string }) => p.userEmail)).toEqual(["friend@test.local"]);
});