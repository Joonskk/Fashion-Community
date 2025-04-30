import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { description, hashtags, imageUrls, userId } = body;
{/*
  // 예시: DB에 저장
  await db.post.create({
    data: {
      description,
      hashtags,
      imageUrls, // 배열로 저장 가능
      userId,
    },
  });
*/}
  return NextResponse.json({ success: true });
}
