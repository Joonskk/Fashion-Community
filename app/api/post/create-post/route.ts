import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import {
    ALLOWED_STYLES,
    ALLOWED_ITEMS,
    ALLOWED_SEASONS,
    ALLOWED_GENDERS,
    ALLOWED_COLORS,
    StyleTag,
    MAX_HASHTAGS_PER_POST,
    FashionAnalysisResult,
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
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
        email,
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

    const userEmail = session?.user?.email || email;
    if (!userEmail) {
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
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                role: "system",
                content: `You are an expert fashion analyst. Analyze the outfit image and extract style categories, items, target season, target fit/gender, and dominant colors.
                Strict constraints:
                - styles: 1 to 3 items from [${ALLOWED_STYLES.join(", ")}]
                - items: 1 to 5 items from [${ALLOWED_ITEMS.join(", ")}]
                - season: 1 item from [${ALLOWED_SEASONS.join(", ")}]
                - gender: 1 item from [${ALLOWED_GENDERS.join(", ")}]
                - colors: 1 to 4 items from [${ALLOWED_COLORS.join(", ")}]`,
                },
                {
                role: "user",
                content: [
                    { type: "text", text: "Analyze this outfit for metadata extraction." },
                    { type: "image_url", image_url: { url: primaryImageUrl } },
                ],
                },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                name: "fashion_analysis",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                    styles: { type: "array", items: { type: "string", enum: ALLOWED_STYLES } },
                    items: { type: "array", items: { type: "string", enum: ALLOWED_ITEMS } },
                    season: { type: "string", enum: ALLOWED_SEASONS },
                    gender: { type: "string", enum: ALLOWED_GENDERS },
                    colors: { type: "array", items: { type: "string", enum: ALLOWED_COLORS } },
                    },
                    required: ["styles", "items", "season", "gender", "colors"],
                    additionalProperties: false,
                },
                },
            },
            });

            const parsed = JSON.parse(aiResponse.choices[0].message.content || "{}");
            if (parsed) {
            aiAnalysis = parsed;
            }
        } catch (aiErr) {
            console.error("AI Analysis failed during post creation:", aiErr);
        }
    }

    // 1. Extract hashtags written in description (if any)
    const captionHashtags = extractHashtags(description);

    // 2. Combine caption tags with selected button styles
    const combinedRawStyles = [...styles, ...captionHashtags, ...(aiAnalysis.styles || []),];

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

    const newPost = {
        userEmail,
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
