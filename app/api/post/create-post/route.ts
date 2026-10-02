import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  ALLOWED_STYLES,
  StyleTag,
  MAX_HASHTAGS_PER_POST,
} from "@/lib/constants";

// Helper function to extract hashtags from raw description text
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#[\w\u00C0-\u024F]+/g);
  if (!matches) return [];
  return matches.map((tag) => tag.slice(1).toLowerCase());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      authorName,
      sex,
      images,
      description,
      styles = [],
      items = [],
      season = "all-season",
      gender = "unisex",
      colors = [],
      likes = [],
      likesCount = 0,
    } = body;

    // 1. Extract hashtags written in description (if any)
    const captionHashtags = extractHashtags(description);

    // 2. Combine caption tags with selected button styles
    const combinedRawStyles = [...styles, ...captionHashtags];

    // 3. Clean raw tags and validate against ALLOWED_STYLES taxonomy
    const validStyles = combinedRawStyles
      .map((tag: string) => tag.toLowerCase().trim())
      .filter((tag: string): tag is StyleTag =>
        (ALLOWED_STYLES as readonly string[]).includes(tag)
      );

    // 4. Deduplicate tags
    const uniqueStyles = Array.from(new Set(validStyles));

    // 5. Enforce strict cap (Max 3 tags per post)
    const finalStyles = uniqueStyles.slice(0, MAX_HASHTAGS_PER_POST);

    // 6. Insert into MongoDB collection
    const client = await clientPromise;
    const db = client.db("wearly");

    const result = await db.collection("posts").insertOne({
      userEmail: email,
      authorName,
      sex,
      images,
      description,
      styles: finalStyles, // Capped to max 3 valid taxonomy tags
      items,
      season,
      gender,
      colors,
      likes,
      likesCount,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, postId: result.insertedId });
  } catch (err) {
    console.error("DB 저장 중 에러:", err);
    return NextResponse.json({ error: "DB 저장 오류" }, { status: 500 });
  }
}
