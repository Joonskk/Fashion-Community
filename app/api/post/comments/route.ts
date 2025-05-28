import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request){

    const body = await req.json();
    const {postId, userEmail, userName, text } = body;

    try {
        const db = (await clientPromise).db('wearly');
        await db.collection('comments').insertOne({
            postId,
            userEmail,
            userName,
            text,
            createdAt: new Date(),
        })
        return NextResponse.json({ success: true });
    } catch(err) {
        console.error('DB 저장 중 에러:', err)
        return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
    }
}

export async function GET() {
    const db = (await clientPromise).db('wearly');

    const comments = await db.collection('comments').find({}, {
        projection: { _id: 1, postId: 1, userEmail: 1, userName: 1, text: 1, createdAt: 1 }
    }).toArray()
  
    return NextResponse.json({ comments })
}