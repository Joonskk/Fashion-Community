import { NextResponse } from "next/server";
import { normalizeTag, StyleTag } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    // ... Call Google Cloud Vision / OpenAI API to get raw tags ...
    const rawAiTags: string[] = ["streetstyle", "oversized", "minimalist", "denim"];

    // Map AI output to your 20 allowed taxonomy tags
    const matchedTags = rawAiTags
      .map((tag: string) => normalizeTag(tag))
      .filter((tag): tag is StyleTag => tag !== null);

    const uniqueAiTags = Array.from(new Set(matchedTags)).slice(0, 3);

    return NextResponse.json({ tags: uniqueAiTags });
  } catch (error) {
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
