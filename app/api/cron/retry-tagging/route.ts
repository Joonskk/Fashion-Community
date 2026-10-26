import { NextResponse } from "next/server";
import { getClient } from "@/lib/mongodb";
import { dueOrStuckFilter, runTaggingJob } from "@/lib/taggingJob";

export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET;
    // 1. Only the scheduler (or you) may call this
    if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getClient();
    const db = client.db("wearly");

    // 2. Find up to 20 posts that are due or stuck
    const posts = await db.collection("posts")
        .find(dueOrStuckFilter(new Date()))      // the same two conditions as the claim
        .project({ _id: 1 })         // only the ids; the job loads the rest
        .limit(20)
        .toArray();

    // 3. Run them one at a time
    for (const p of posts) {
        await runTaggingJob(db, p._id);
    }

    return NextResponse.json({ processed: posts.length });
}