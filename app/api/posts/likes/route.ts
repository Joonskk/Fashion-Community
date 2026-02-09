import { NextRequest, NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";
import type { Document } from 'mongodb'

export async function GET(req: NextRequest) {
    const email = req.headers.get('user-email');
    if (!email) {
        return NextResponse.json({ message: 'Missing email' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('wearly');

    const { searchParams } = new URL(req.url);
    const sexParam = searchParams.get("sex"); // male | female

    const query: Document = {
        likes: email
    };

    if (sexParam && sexParam !== "all") {
        query.sex = sexParam;
    }

    const likedPosts = await db.collection('posts')
        .find(query, {
            projection: { _id: 1, userEmail: 1, sex: 1, images: 1, description: 1, likes: 1, likesCount: 1, createdAt: 1 }
        })
        .sort({ createdAt: -1 })
        .toArray();

    return NextResponse.json({ likedPosts });
}