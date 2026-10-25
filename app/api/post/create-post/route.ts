import { NextResponse } from "next/server";
import { getClient } from "@/lib/mongodb";
import { getSessionEmail } from "@/lib/session";
import {
    FashionAnalysisResult,
} from "@/lib/constants";
import { tagImage } from "@/lib/tagging";
import { mergeStyles } from "@/lib/styles";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
        authorName,
        sex,
        images,
        description = "",
        styles = [],
        items = [],
        season = "all-season",
        gender = "unisex",
        colors = [],
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

    const primaryImageUrl = typeof images[0] === "string" ? images[0] : images[0]?.url;

    // --- Automatic AI Vision Analysis ---
    let aiAnalysis: Partial<FashionAnalysisResult> = {};

    if (primaryImageUrl) {
        try {
            aiAnalysis = await tagImage(primaryImageUrl);
        } catch (aiErr) {
            console.error("AI Analysis failed during post creation:", aiErr);
        }
    }

    const finalStyles = mergeStyles(styles, description, aiAnalysis.styles || []);

    // 6. Insert into MongoDB collection
    const client = await getClient();
    const db = client.db("wearly");

    const newPost = {
        userEmail: sessionEmail,
        authorName,
        sex,
        images,
        description,
        styles: finalStyles,
        items: aiAnalysis.items?.length ? aiAnalysis.items : items,
        season: aiAnalysis.season || season,
        gender: aiAnalysis.gender || gender,
        colors: aiAnalysis.colors?.length ? aiAnalysis.colors : colors,
        likes,
        likesCount,
        createdAt: new Date(),
    };
  
    const result = await db.collection("posts").insertOne(newPost);
  

    return NextResponse.json({ success: true, postId: result.insertedId, post: newPost });
  } catch (err) {
    console.error("DB 저장 중 에러:", err);
    return NextResponse.json({ error: "DB 저장 오류" }, { status: 500 });
  }
}
