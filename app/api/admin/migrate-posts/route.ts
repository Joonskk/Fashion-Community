// This is a code to update existed data. (After adding styles, items, seasons, genders, and colors)

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import OpenAI from "openai";
import {
  ALLOWED_STYLES,
  ALLOWED_ITEMS,
  ALLOWED_SEASONS,
  ALLOWED_GENDERS,
  ALLOWED_COLORS,
  FashionAnalysisResult,
  MAX_HASHTAGS_PER_POST,
  StyleTag,
} from "@/lib/constants";
import { extractHashtags } from "../../post/create-post/route";

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("wearly");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 1. Find all posts missing metadata (or missing items/colors)
    // styles, items, season
    // missing all
    // exist but empty
    const postsToUpdate = await db
      .collection("posts")
      .find({
        $or: [
            { styles: { $exists: false } },
            { styles: { $size: 0 } },
            { items: { $exists: false } },
            { items: { $size: 0 } },
            { season: { $exists: false } },
            { gender: {$exists: false } },
            { gender: "unisex"},
            { colors: {$exists: false } },
            { colors: { $size: 0 } },
        ],
      })
      .toArray();

    console.log(`Found ${postsToUpdate.length} existing posts to analyze and update.`);

    let updatedCount = 0;
    let failedCount = 0;

    for (const post of postsToUpdate) {
      // Extract primary image URL
      const images = post.images || [];
      if (images.length === 0) continue;

      const primaryImageUrl =
        typeof images[0] === "string" ? images[0] : images[0]?.url;

      if (!primaryImageUrl) continue;

      try {
        // 2. Run OpenAI Vision Analysis
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-5.6-luna",
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

        const parsed: FashionAnalysisResult = JSON.parse(
          aiResponse.choices[0].message.content || "{}"
        );

        if (parsed) {
            // Merge description hashtags, existing post styles, and AI styles
            const captionHashtags = extractHashtags(post.description || "");
            const existingStyles = Array.isArray(post.styles) ? post.styles : [];
            
            const combinedRawStyles = [
              ...existingStyles,
              ...captionHashtags,
              ...(parsed.styles || []),
            ];
  
            const validStyles = combinedRawStyles
              .map((tag: string) => tag.toLowerCase().trim())
              .filter((tag: string): tag is StyleTag =>
                (ALLOWED_STYLES as readonly string[]).includes(tag)
              );
  
            const finalStyles = Array.from(new Set(validStyles)).slice(
              0,
              MAX_HASHTAGS_PER_POST
            );
  
            await db.collection("posts").updateOne(
              { _id: post._id },
              {
                $set: {
                  styles: finalStyles,
                  items: parsed.items || [],
                  season: parsed.season || "all-season",
                  gender: parsed.gender || ALLOWED_GENDERS[0],
                  colors: parsed.colors || [],
                },
              }
            );
            updatedCount++;
          }
        } catch (postErr) {
          console.error(`Failed to update post ${post._id}:`, postErr);
          failedCount++;
        }
      }
  
      return NextResponse.json({
        success: true,
        message: `Migration complete. Updated: ${updatedCount}, Failed: ${failedCount}, Total: ${postsToUpdate.length}`,
      });
    } catch (err) {
      console.error("Migration failed:", err);
      return NextResponse.json({ error: "Migration error" }, { status: 500 });
    }
  }
  