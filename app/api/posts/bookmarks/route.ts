import { NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";

export async function GET() {
    const client = await clientPromise;
    const db = client.db('wearly');

    const bookmarkedPosts = await db.collection('bookmarks').find({}, {
        projection: { _id: 1, postId: 1, imageURLs: 1, userEmail: 1 }
    }).toArray()
  
    return NextResponse.json({ bookmarkedPosts })
}