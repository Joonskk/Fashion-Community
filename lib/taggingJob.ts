import { Db, ObjectId } from "mongodb";
import { tagImage } from "@/lib/tagging";
import { mergeStyles } from "@/lib/styles";
import { AI_MAX_ATTEMPTS, AI_RETRY_BASE_MS, AI_LOCK_TIMEOUT_MS } from "@/lib/constants";

export async function runTaggingJob(db: Db, postId: ObjectId) {
    const now = new Date();

    // 1. Claim: find the post AND mark it as taken, in ONE operation
    const post = await db.collection("posts").findOneAndUpdate(
        {
            _id: postId,
            $or: [
                { 
                    aiStatus: "pending",
                    aiNextAttemptAt: { $lte: now } 
                },               // due
                { 
                    aiStatus: "processing", 
                    aiLockedAt: { $lte: new Date(now.getTime() - AI_LOCK_TIMEOUT_MS) } 
                }, // stuck
            ],
        },
        { $set: { aiStatus: "processing", aiLockedAt: now } },
    );

    if (!post) return;  // not found, not due yet, or another worker already took it

    // 2. Tag the image
    const imageUrl = typeof post.images[0] === "string" ? post.images[0] : post.images[0]?.url;

    try {
        const tags = await tagImage(imageUrl);

        // 3. Success: save the tags and mark the post done
        await db.collection("posts").updateOne(
            { _id: postId },
            {
                $set: {
                    styles: mergeStyles(post.styles, post.description, tags.styles),
                    items: tags.items,
                    season: tags.season,
                    gender: tags.gender,
                    colors: tags.colors,
                    aiStatus: "done",
                    aiError: null,      // the post worked, so no error anymore
                    aiLockedAt: null,   // the job is finished, so release the lock
                },
            },
        );
    } catch (err) {
        const attempts = (post.aiAttempts ?? 0) + 1;
        const message = err instanceof Error ? err.message : String(err);

        if (attempts >= AI_MAX_ATTEMPTS) {
            // gave up: stop retrying
            await db.collection("posts").updateOne({ _id: postId }, {
                $set: { aiStatus: "failed", aiAttempts: attempts, aiError: message, aiLockedAt: null },
            });
        } else {
            // try again later, waiting twice as long each time
            const delayMs = AI_RETRY_BASE_MS * 2 ** (attempts - 1);
            await db.collection("posts").updateOne({ _id: postId }, {
                $set: {
                    aiStatus: "pending",
                    aiAttempts: attempts,
                    aiNextAttemptAt: new Date(Date.now() + delayMs),
                    aiError: message,
                    aiLockedAt: null,
                },
            });
        }
    }
}