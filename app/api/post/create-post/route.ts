import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    const userId = session?.user?.name as string;
        
    const body = await req.json();
    
    try {
        const db = (await clientPromise).db('wearly');
        await db.collection('posts').insertOne({
            userId,
            body
        })
        return NextResponse.json({ success: true });
    } catch(err) {
        console.error('DB 저장 중 에러:', err)
        return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
    }
}
