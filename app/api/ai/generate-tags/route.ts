// app/api/ai/generate-tags/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ALLOWED_STYLES,
  ALLOWED_ITEMS,
  ALLOWED_SEASONS,
  ALLOWED_GENDERS,
  ALLOWED_COLORS,
  FashionAnalysisResult,
} from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // 1. OpenAI Vision Structured Extraction
    const response = await openai.chat.completions.create({
      model: "gpt-5.6-luna", // Upgraded to gpt-4o for maximum accuracy
      messages: [
        {
          role: "system",
          content: `You are an expert fashion analyst. Analyze the outfit in the provided image and extract its style categories, items present, target season, target gender/fit, and primary colors.
          
          Strict rules:
          - Select 1 to 3 styles ONLY from this list: ${ALLOWED_STYLES.join(", ")}.
          - Select 1 to 5 items ONLY from this list: ${ALLOWED_ITEMS.join(", ")}.
          - Select 1 primary season ONLY from this list: ${ALLOWED_SEASONS.join(", ")}.
          - Select 1 target gender/fit ONLY from this list: ${ALLOWED_GENDERS.join(", ")}.
          - Select 1 to 4 primary colors ONLY from this list: ${ALLOWED_COLORS.join(", ")}.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this outfit and return JSON." },
            { type: "image_url", image_url: { url: imageUrl } },
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
              styles: {
                type: "array",
                items: { type: "string", enum: ALLOWED_STYLES },
                description: "Up to 3 style tags",
              },
              items: {
                type: "array",
                items: { type: "string", enum: ALLOWED_ITEMS },
                description: "Clothing items visible",
              },
              season: {
                type: "string",
                enum: ALLOWED_SEASONS,
                description: "Best suited season",
              },
              gender: {
                type: "string",
                enum: ALLOWED_GENDERS,
                description: "Target fit/gender",
              },
              colors: {
                type: "array",
                items: { type: "string", enum: ALLOWED_COLORS },
                description: "Dominant colors",
              },
            },
            required: ["styles", "items", "season", "gender", "colors"],
            additionalProperties: false,
          },
        },
      },
    });

    const analysisResult: FashionAnalysisResult = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error) {
    console.error("Error generating tags:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
