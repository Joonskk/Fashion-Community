import { NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
    const email = req.headers.get('user-email');
    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('wearly');

    const bookmarks = await db.collection('bookmarks').find({
        userEmail: email
    }).toArray();
  
    const postIds = bookmarks.map(bookmark => bookmark.postId);

    // posts 컬렉션에서 postId가 일치하는 게시물 조회 + 최신순 정렬
    const posts = await db.collection('posts')
        .find({_id: { $in: postIds.map((id: string) => new ObjectId(id))}})
        .sort({ createdAt: -1 })
        .toArray();

    return NextResponse.json({ bookmarkedPosts : posts })
}