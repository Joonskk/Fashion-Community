import { Db, ObjectId } from "mongodb";

export async function runTaggingJob(db: Db, postId: ObjectId) {
    const now = new Date();

    // 1. Claim: find the post AND mark it as taken, in ONE operation
    const post = await db.collection("posts").findOneAndUpdate(
        {
            _id: postId,
            aiStatus: "pending",                    // only posts waiting to be tagged
            aiNextAttemptAt: { $lte: now },         // whose time has come ($lte = "less than or equal")
        },
        { $set: { aiStatus: "processing", aiLockedAt: now } },
    );

    if (!post) return;  // not found, not due yet, or another worker already took it

}