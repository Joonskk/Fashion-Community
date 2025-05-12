// 홈 화면용 게시물 받아오기 API

import { NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";

export async function GET() {
    const client = await clientPromise;
    const db = client.db('wearly');

    const posts = await db.collection('posts').find({}, {
        projection: { _id: 0, userEmail: 1, body: 1 } // _id는 제외하고 필요한 필드만 가져옴
    }).toArray()
  
    return NextResponse.json({ posts })
}