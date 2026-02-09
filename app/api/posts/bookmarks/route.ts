import { NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb'

export async function GET(req: Request) {
    const email = req.headers.get('user-email');
    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('wearly');

    const { searchParams } = new URL(req.url);
    const sexParam = searchParams.get("sex"); // male | female

    const bookmarks = await db.collection('bookmarks').find({
        userEmail: email
    }).toArray();
  
    const postIds = bookmarks.map(bookmark => new ObjectId(bookmark.postId));
    if (postIds.length === 0) {
        return NextResponse.json({ posts: [] });
    }

    const query: Document = { _id: { $in: postIds } };

    if (sexParam && sexParam !== 'all') {
        query.sex = sexParam;
    }

    // posts 컬렉션에서 postId가 일치하는 게시물 조회 + 최신순 정렬
    const bookmarkedPosts = await db.collection('posts')
        .find(query, {
            projection: { _id: 1, userEmail: 1, sex:1, images: 1, description: 1, likes: 1, likesCount: 1, createdAt: 1 }
        })
        .sort({ createdAt: -1 })
        .toArray();

    return NextResponse.json({ bookmarkedPosts })
}