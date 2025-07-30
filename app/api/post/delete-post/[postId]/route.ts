import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// DELETE: 게시물 삭제
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, context: any) {
    const postId = context.params.postId;

    try {
        const db = (await clientPromise).db('wearly');
        await db.collection("posts").deleteOne({
            _id: new ObjectId(postId),
        })

        await db.collection("comments").deleteMany({
            postId: postId,
        })

        await db.collection("bookmarks").deleteMany({
            postId: postId,
        })

        return NextResponse.json(
            { message: "게시물이 성공적으로 삭제되었습니다." },
            { status: 200 }
        );
    } catch(err) {
        console.error("게시물 삭제 오류:", err);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}