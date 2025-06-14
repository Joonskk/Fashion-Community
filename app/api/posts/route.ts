// 홈 화면용 게시물 받아오기 API

import { NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";

export async function GET() {
    const client = await clientPromise;
    const db = client.db('wearly');

    const posts = await db.collection('posts').find({}, {
        projection: { _id: 1, userEmail: 1, imageURLs: 1, description: 1, likes: 1, likesCount: 1, createdAt: 1 }
    }).sort({ createdAt: -1 }).toArray()
  
    return NextResponse.json({ posts })
}