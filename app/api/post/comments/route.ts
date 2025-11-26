import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type Comment = {
    _id?: ObjectId;
    postId: string;
    userId: string;
    userEmail: string;
    userName: string;
    profileImage: string;
    text: string;
    createdAt: Date;
  }

export async function POST(req: Request){

    const body = await req.json();
    const {postId, userId, userEmail, profileImage, userName, text } = body;

    try {
        const db = (await clientPromise).db('wearly');
        const newComment : Comment = {
            postId,
            userId,
            userEmail,
            userName,
            profileImage,
            text,
            createdAt: new Date(),
        };

        const result = await db.collection('comments').insertOne(newComment);

        newComment._id = result.insertedId;

        return NextResponse.json({ success: true, comment: newComment });
    } catch(err) {
        console.error('DB 저장 중 에러:', err)
        return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
    }
}

export async function GET() {
    const db = (await clientPromise).db('wearly');

    const comments = await db.collection('comments').find({}, {
        projection: { _id: 1, postId: 1, userId: 1, userEmail: 1, userName: 1, profileImage: 1, text: 1, createdAt: 1 }
    }).toArray()
  
    return NextResponse.json({ comments })
}
