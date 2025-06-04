import { NextRequest, NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {

    const email = req.headers.get('user-email');
    if (!email) {
        return NextResponse.json({ message: 'Missing email' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('wearly');

    const likedPostsRaw = await db.collection('posts').find(
        { likes: email },
        {
            projection: { _id: 1, imageURLs: 1 }
        }
    ).toArray();

    // _id를 postId로 변경
    const likedPosts = likedPostsRaw.map(post => ({
        postId: post._id,
        imageURLs: post.imageURLs,
    }));
  
    return NextResponse.json({ likedPosts });
}