import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {

    const body = await req.json();
    const { email, imageURLs, description, likes, likesCount } = body;
    
    try {
        console.log("First")
        const db = (await clientPromise).db('wearly');
        console.log("Second")
        await db.collection('posts').insertOne({
            userEmail: email,
            imageURLs,
            description,
            likes,
            likesCount,
        })
        console.log("Third")
        return NextResponse.json({ success: true });
    } catch(err) {
        console.error('DB 저장 중 에러:', err)
        return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
    }
}
