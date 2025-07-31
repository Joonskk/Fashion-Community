import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {

    const body = await req.json();
    const { email, images, description, likes, likesCount } = body;
    
    try {
        const db = (await clientPromise).db('wearly');
        await db.collection('posts').insertOne({
            userEmail: email,
            images,
            description,
            likes,
            likesCount,
            createdAt: new Date(),
        })
        return NextResponse.json({ success: true });
    } catch(err) {
        console.error('DB 저장 중 에러:', err)
        return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
    }
}
