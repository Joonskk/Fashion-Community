import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request){

    const body = await req.json();
    const { postId, userEmail } = body;

    try {
        const db = (await clientPromise).db('wearly');
        const bookmarks = db.collection('bookmarks');

        const existing = await bookmarks.findOne({postId, userEmail});

        if(existing){
            await bookmarks.deleteOne({ postId, userEmail });
            return NextResponse.json({ success: true, bookmarked: false });
        } else {
            await bookmarks.insertOne({ postId, userEmail });
            return NextResponse.json({ success: true, bookmarked: true });
        }
    } catch(err) {
        console.error('DB 저장 중 에러:', err)
        return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const userEmail = searchParams.get("userEmail");

    try {
        const db = (await clientPromise).db('wearly');
        const bookmarks = db.collection('bookmarks');

        const isBookmarked = await bookmarks.findOne({ postId, userEmail });
        return NextResponse.json({ bookmarked: !!isBookmarked });
    } catch (err) {
        console.error("DB 조회 실패:", err);
        return NextResponse.json({ error: '조회 실패' }, { status: 500 });
    }
}