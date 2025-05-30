import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function DELETE (req: Request, {params} : {params : { commentId : string }}){
    try {
        const db = (await clientPromise).db('wearly');
        await db.collection('comments').deleteOne({
            _id: new ObjectId(params.commentId)
        })
        return NextResponse.json({ message: '댓글이 성공적으로 삭제되었습니다.' }, { status: 200 });
    } catch(err) {
        console.error('댓글 삭제 오류:', err);
        return NextResponse.json({ message: '서버 오류' }, { status: 500 });
    }
}