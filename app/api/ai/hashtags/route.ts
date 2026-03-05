import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 우리가 허용한 태그 리스트
const allowedTags = [
    // 스타일
    "#미니멀", "#스트릿", "#캐주얼", "#포멀", "#빈티지", "#댄디", "#스포티", "#페미닌", "#클래식", "#모던", "#시크", "#보헤미안", "#락", "#힙합", "#컨템포러리", "시티보이",
    // 계절
    "#봄", "#여름", "#가을", "#겨울",
    // 포인트
    "#데님", "#레더", "#코튼", "#울", "#린넨", "#실크", "#폴리", "#니트", "#벨벳", "#플란넬", "#레이스", "#스웨이드", "#새틴", "#오가닉", "#트위드", "#시폰"
  ];

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "No image URL" }, { status: 400 });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that suggests 3-5 fashion hashtags for an image. 
Only pick hashtags from this allowed list: ${allowedTags.join(", ")}. Only pick one among the seasons.
Return them as a JSON array.`
        },
        {
          role: "user",
          content: `Suggest hashtags for this image: ${imageUrl}`
        }
      ],
      temperature: 0.7
    });

    const rawText = completion.choices[0]?.message?.content || "";
    
    // AI가 준 결과를 array로 파싱
    let hashtags: string[] = [];
    try {
      hashtags = JSON.parse(rawText).filter((tag: string) => allowedTags.includes(tag));
    } catch {
      // JSON parsing 실패하면, rawText를 단어별로 필터링
      hashtags = rawText
        .split(/[\s,]+/)
        .map(tag => tag.startsWith("#") ? tag : `#${tag}`)
        .filter(tag => allowedTags.includes(tag))
        .slice(0, 5);
    }

    return NextResponse.json({ hashtags });
  } catch (err) {
    console.error("AI hashtag error:", err);
    return NextResponse.json({ error: "Failed to generate hashtags" }, { status: 500 });
  }
}