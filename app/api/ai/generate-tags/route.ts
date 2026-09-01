import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

type GenerateTagsRequest = {
  images: string[];       // Cloudinary URL
};

export async function POST(req: Request) {
  try {
    const body: GenerateTagsRequest = await req.json();
    const { images } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Sample Tags
    const styles = [
      "casual","street","minimal","classic","formal","preppy",
      "sporty","vintage","retro","bohemian","chic","grunge",
      "edgy","punk","hiphop","k-pop","elegant","romantic",
      "modern","artsy","androgynous","techwear","athleisure",
      "outdoor","luxury","business","smart casual","cozy","monochrome",
    ];

    const items = [
      "t-shirt","shirt","blouse","sweater","hoodie","knit","cardigan",
      "denim jacket","leather jacket","bomber jacket","coat","trench coat",
      "puffer jacket","jeans","chinos","skirt","dress","shorts","leggings",
      "sneakers","boots","loafers","heels","sandals","bag","cap","hat",
      "scarf","belt","glasses","watch","socks","tie","necklace","bracelet",
    ];

    const season = ["spring","summer","fall","winter"];


    let combinedLabels: string[] = [];

    // Call Google Vision Label Detection for all images
    for (const imageUrl of images) {
      const [result] = await client.labelDetection(imageUrl);
      const labels = result.labelAnnotations
    ?.map(label => label.description?.toLowerCase())
    .filter((desc): desc is string => !!desc) || [];
      combinedLabels.push(...labels);
    }

    console.log("combinedLabels: ", combinedLabels);

    // 추출한 라벨을 미리 정의한 카테고리에 매핑
    const extracted = {
      styles: styles.filter(s => combinedLabels.includes(s)),
      items: items.filter(i => combinedLabels.includes(i)),
      season: season.filter(se => combinedLabels.includes(se)),
    };

    return NextResponse.json(extracted);

  } catch (err) {
    console.error("Google Vision AI 태그 생성 오류:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}