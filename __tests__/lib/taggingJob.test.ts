// Fake tagImage: each test decides whether "OpenAI" succeeds or fails
jest.mock("@/lib/tagging", () => ({ tagImage: jest.fn() }));

import { tagImage } from "@/lib/tagging";
const mockTagImage = tagImage as jest.Mock;

import type { Db } from "mongodb";
import { startTestDb } from "@/test-utils/db";
import { runTaggingJob } from "@/lib/taggingJob";
import { AI_MAX_ATTEMPTS, AI_RETRY_BASE_MS } from "@/lib/constants";
import { run } from "node:test";

jest.setTimeout(60_000);

let db: Db;
let stop: () => Promise<void>;

beforeAll(async () => { ({ db, stop } = await startTestDb()); });
afterAll(() => stop());
beforeEach(async () => { await db.collection("posts").deleteMany({}); });

const TAGS = { styles: ["streetwear"], items: ["jeans"], season: "fall", gender: "menswear", colors: ["black"] };

// Insert a post that is pending and due now; `overrides` changes any field
async function insertPost(overrides: object = {}) {
    const { insertedId } = await db.collection("posts").insertOne({
        images: ["https://example.com/a.jpg"], description: "", styles: [],
        aiStatus: "pending", aiAttempts: 0, aiNextAttemptAt: new Date(),
        aiLockedAt: null, aiError: null,
        ...overrides,
    });
    return insertedId;
}

describe("runTaggingJob", () => {
    test("success: saves tags and marks the post done", async () => {
        mockTagImage.mockResolvedValue(TAGS);
        const id = await insertPost();

        await runTaggingJob(db, id);

        const post = await db.collection("posts").findOne({ _id: id });
        expect(post?.aiStatus).toBe("done");
        expect(post?.season).toBe("fall");
        expect(post?.aiLockedAt).toBeNull();
    });

    test("failure: stays pending and schedules a retry with backoff", async () => {
        mockTagImage.mockRejectedValue(new Error("down"));
        const id = await insertPost();

        const before = Date.now();
        await runTaggingJob(db, id);

        const post = await db.collection("posts").findOne({ _id: id });
        expect(post?.aiStatus).toBe("pending");
        expect(post?.aiAttempts).toBe(1);
        expect(post?.aiError).toBe("down");
        expect(post?.aiLockedAt).toBeNull();

        // next try is about one base delay from now (1st failure: 2 ** 0 = 1x)
        const next = post?.aiNextAttemptAt.getTime();
        expect(next).toBeGreaterThanOrEqual(before + AI_RETRY_BASE_MS);
        expect(next).toBeLessThan(before + AI_RETRY_BASE_MS + 5_000);
    });

    test("last allowed failure: marks the post failed", async () => {
        mockTagImage.mockRejectedValue(new Error("down"));
        const id = await insertPost({ aiAttempts: AI_MAX_ATTEMPTS - 1 });

        const before = Date.now();
        await runTaggingJob(db, id);

        const post = await db.collection("posts").findOne({ _id: id });
        expect(post?.aiStatus).toBe("failed");
        expect(post?.aiAttempts).toBe(AI_MAX_ATTEMPTS);
        expect(post?.aiError).toBe("down");
        expect(post?.aiLockedAt).toBeNull();
    });

    test("not due yet: does nothing and doesn't call tagImage", async () => {
        mockTagImage.mockResolvedValue(TAGS);
        const inOneHour = new Date(Date.now() + 60 * 60_000);
        const id = await insertPost({ aiNextAttemptAt: inOneHour });   // waiting for its retry time

        await runTaggingJob(db, id);

        const post = await db.collection("posts").findOne({ _id: id });
        expect(mockTagImage).not.toHaveBeenCalled();   // no OpenAI call, so no money spent
        expect(post?.aiStatus).toBe("pending");         // untouched
        expect(post?.aiAttempts).toBe(0);
    });

    test("stuck in processing past the lock timeout: reclaims and tags it", async () => {
        mockTagImage.mockResolvedValue(TAGS);
        const tenMinutesAgo = new Date(Date.now() - 10 * 60_000);
        const id = await insertPost({ aiStatus: "processing", aiLockedAt: tenMinutesAgo });  // its worker died

        await runTaggingJob(db, id);

        const post = await db.collection("posts").findOne({ _id: id });
        expect(mockTagImage).toHaveBeenCalledTimes(1);
        expect(post?.aiStatus).toBe("done");
        expect(post?.season).toBe("fall");
        expect(post?.aiLockedAt).toBeNull();
    });

    test("two workers at once: only one claims the post", async () => {
        mockTagImage.mockResolvedValue(TAGS);
        const id = await insertPost();

        // Start both jobs at the same moment, like after() and the sweep colliding
        await Promise.all([
            runTaggingJob(db, id),
            runTaggingJob(db, id),
        ]);

        const post = await db.collection("posts").findOne({ _id: id });
        expect(mockTagImage).toHaveBeenCalledTimes(1);   // OpenAI called once, not twice
        expect(post?.aiStatus).toBe("done");
        expect(post?.aiAttempts).toBe(0);                // no fake failure recorded

    });
});
