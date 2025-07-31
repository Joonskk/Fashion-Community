import { NextRequest, NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {

    const email = req.headers.get('user-email');
    if (!email) {
        return NextResponse.json({ message: 'Missing email' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('wearly');

    const likedPosts = await db.collection('posts').find(
        { likes: email }).sort({ createdAt: -1 }).toArray();
  
    return NextResponse.json({ likedPosts });
}