import { NextResponse, after } from "next/server";
import { getClient } from "@/lib/mongodb";
import { getSessionEmail } from "@/lib/session";
import { mergeStyles } from "@/lib/styles";
import { runTaggingJob } from "@/lib/taggingJob";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
        authorName,
        sex,
        images,
        description = "",
        styles = [],
        likes = [],
        likesCount = 0,
    } = body;

    const sessionEmail = await getSessionEmail();
    if (!sessionEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required." },
        { status: 400 }
      );
    }

    const finalStyles = mergeStyles(styles, description, []);

    const client = await getClient();
    const db = client.db("wearly");

    const newPost = {
        userEmail: sessionEmail,
        authorName,
        sex,
        images,
        description,
        styles: finalStyles,
        items: [],
        season: null,
        gender: null,
        colors: [],
        likes,
        likesCount,
        createdAt: new Date(),
        aiStatus: "pending",
        aiAttempts: 0,
        aiNextAttemptAt: new Date(),
        aiLockedAt: null,
        aiError: null,
    };
  
    const result = await db.collection("posts").insertOne(newPost);
  
    after(() => runTaggingJob(db, result.insertedId));

    return NextResponse.json({ success: true, postId: result.insertedId, post: newPost });
  } catch (err) {
    console.error("DB 저장 중 에러:", err);
    return NextResponse.json({ error: "DB 저장 오류" }, { status: 500 });
  }
}
