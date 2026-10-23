// A fake for openai.chat.completions.create. Each test decides what it returns.
const mockCreate = jest.fn();

jest.mock("openai", () => ({
    __esModule: true,
    // `new OpenAI(...)` in the route now builds this fake object instead
    default: jest.fn().mockImplementation(() => ({
        chat: { completions: { create: mockCreate } },
    })),
}));

// A fake for getServerSession. Each test decides who is "logged in".
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));

import { getServerSession } from "next-auth"; // this import is now the fake
const mockSession = getServerSession as jest.Mock;

import { ObjectId } from "mongodb";
import type { Db } from "mongodb";
import { startTestDb } from "@/test-utils/db";

// First run downloads a MongoDB binary, so allow more than Jest's 5s default.
jest.setTimeout(60_000);

let db: Db;
let stop: () => Promise<void>;
let POST: typeof import("@/app/api/post/create-post/route").POST;

beforeAll(async () => {
    ({ db, stop } = await startTestDb());

    ({ POST } = await import("@/app/api/post/create-post/route"));
});

afterAll(() => stop());

beforeEach(async () => {
    await db.collection("posts").deleteMany({});
});

function makeRequest(body: object) {
    return new Request("http://localhost/api/post/create-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("POST /api/post/create-post", () => {
    test("returns 401 when logged out and no email is given", async () => {
        mockSession.mockResolvedValue(null);                // nobody logged in

        const res = await POST(makeRequest({
            images: ["https://example.com/a.jpg"],          // valid image, so the 401 can't come from that
        }));
        expect(res.status).toBe(401);
        expect(mockCreate).not.toHaveBeenCalled();          // stopped before spending on OpenAI
    })

    test("returns 401 when logged out even if the body has an email  ", async () => {
        mockSession.mockResolvedValue(null);                // nobody logged in

        const res = await POST(makeRequest({
            images: ["https://example.com/a.jpg"],          // valid image, so the 401 can't come from that
            email: "victim@test.com",
        }));
        expect(res.status).toBe(401);
        expect(mockCreate).not.toHaveBeenCalled();          // stopped before spending on OpenAI
        expect(await db.collection("posts").countDocuments()).toBe(0);  // nothing saved
    })

    test("returns 400 when no images are sent, without calling OpenAI", async () => {
        // Arrange
        mockSession.mockResolvedValue({ user: { email: "me@test.com" } });  // logged in

        // Act
        const res = await POST(makeRequest({
                images: [],                                     // no image returns
            }));

        // Assert
        expect(res.status).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled()           // stopped before spending on OpenAI
    })

    test("saves the AI's tags when OpenAI succeeds", async () => {
        // Arrange
        mockSession.mockResolvedValue({ user: { email: "me@test.com" } });  // logged in

        mockCreate.mockResolvedValue({                                      // AI answered
            choices: [{ message: { content: JSON.stringify({
                styles: ["streetwear"], items: ["jeans"], season: "fall",
                gender: "menswear", colors: ["black"],
            }) } }],
        });
        
        // Act
        const res = await POST(makeRequest({
            images: ["https://example.com/a.jpg"],
        }));
        const body = await res.json();

        // Assert: response
        expect(res.status).toBe(200);

        // Assert: what's actually in the DB
        const saved = await db.collection('posts').findOne({ _id: new ObjectId(body.postId as string) });
        expect(saved?.season).toBe("fall");
        expect(saved?.items).toEqual(["jeans"]);
        expect(saved?.colors).toEqual(["black"]);
    })

    test("OpenAI fails, but the post is still saved", async () => {
        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {}); // hide expected console error

        // Arrange
        mockSession.mockResolvedValue({ user: { email: "me@test.com" } });  // logged in

        mockCreate.mockRejectedValue(new Error("OpenAI is down"));          // AI failed
        
        // Act
        const res = await POST(makeRequest({
            images: ["https://example.com/a.jpg"],
        }));
        const body = await res.json();

        // Assert: response
        expect(res.status).toBe(200);

        // Assert: what's actually in the DB
        const saved = await db.collection('posts').findOne({ _id: new ObjectId(body.postId as string) });
        expect(saved?.season).toBe("all-season");
        expect(saved?.gender).toBe("unisex");

        errorSpy.mockRestore();                                             // put the real console.error back
    })

    test("merges button, hashtag and AI styles, user's first, capped at 3", async () => {
        // Arrange
        mockSession.mockResolvedValue({ user: { email: "me@test.com" } });  // logged in

        mockCreate.mockResolvedValue({                                      // AI answered
            choices: [{ message: { content: JSON.stringify({
                styles: ["streetwear", "minimalist"], items: ["jeans"], season: "fall",
                gender: "menswear", colors: ["black"],
            }) } }],
        });
        
        // Act
        const res = await POST(makeRequest({
            images: ["https://example.com/a.jpg"],
            styles: ["casual"],                       // button click
            description: "#y2k #notarealstyle",       // caption hashtags
        }));
        const body = await res.json();

        // Assert: response
        expect(res.status).toBe(200);

        // Assert: what's actually in the DB
        const saved = await db.collection('posts').findOne({ _id: new ObjectId(body.postId as string) });
        expect(saved?.styles).toEqual(["casual", "y2k", "streetwear"]);
    })
})