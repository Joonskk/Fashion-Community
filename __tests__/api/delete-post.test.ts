jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));

// The route calls cloudinary.config(...) on import and uploader.destroy(...) per image.
const mockDestroy = jest.fn();
jest.mock("cloudinary", () => ({
    v2: { config: jest.fn(), uploader: { destroy: mockDestroy } },
}));

import { getServerSession } from "next-auth";
const mockSession = getServerSession as jest.Mock;

import { ObjectId } from "mongodb";
import type { Db } from "mongodb";
import { NextRequest } from "next/server";
import { startTestDb } from "@/test-utils/db";

jest.setTimeout(60_000);

let db: Db;
let stop: () => Promise<void>;
let DELETE: typeof import("@/app/api/post/delete-post/[postId]/route").DELETE;

const postId = new ObjectId();

beforeAll(async () => {
    ({ db, stop } = await startTestDb());

    ({ DELETE } = await import("@/app/api/post/delete-post/[postId]/route"));
});

afterAll(() => stop());

beforeEach(async () => {
    await db.collection("posts").deleteMany({});
    await db.collection("posts").insertOne({
        _id: postId,
        userEmail: "owner@test.com",
        images: [
            { url: "https://example.com/1.jpg", public_id: "img1" },
            { url: "https://example.com/2.jpg", public_id: "img2" },
        ],
    });
})

function remove(email: string | null) {
    mockSession.mockResolvedValue(email ? { user: { email } } : null);
    
    return DELETE(new NextRequest("http://localhost", {
        method: "DELETE"
    }), {
        params: Promise.resolve({ postId: postId.toString() }) })
}

describe("DELETE /api/post/delete-post/[postId]", () => {
    test("returns 401 when logged out, and deletes nothing", async () => {
        const res = await remove(null);

        expect(res.status).toBe(401);
        expect(await db.collection('posts').findOne({ _id: postId })).not.toBeNull();
        expect(mockDestroy).not.toHaveBeenCalled();
    })

    test("returns 403 when someone else tries to delete it", async () => {
        const res = await remove("stranger@test.com");

        expect(res.status).toBe(403);
        expect(await db.collection('posts').findOne({ _id: postId })).not.toBeNull();
        expect(mockDestroy).not.toHaveBeenCalled();
    })

    test("the owner can delete it, and its images are removed", async () => {
        const res = await remove("owner@test.com");

        expect(res.status).toBe(200);
        expect(await db.collection('posts').findOne({ _id: postId })).toBeNull();
        expect(mockDestroy).toHaveBeenCalledTimes(2);
        expect(mockDestroy).toHaveBeenCalledWith("img1");
    })
})