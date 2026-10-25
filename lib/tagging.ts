import OpenAI from "openai";
import {
    AI_TAGGING_MODEL,
    ALLOWED_STYLES,
    ALLOWED_ITEMS,
    ALLOWED_SEASONS,
    ALLOWED_GENDERS,
    ALLOWED_COLORS,
    FashionAnalysisResult
} from "@/lib/constants";

export async function tagImage(imageUrl: string): Promise<FashionAnalysisResult> { 
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const aiResponse = await openai.chat.completions.create({
    model: AI_TAGGING_MODEL,
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

    const content = aiResponse.choices[0].message.content;
    if (!content) throw new Error("OpenAI returned an empty response.");

    return JSON.parse(content);
}