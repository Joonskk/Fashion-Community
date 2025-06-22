import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// DELETE: 댓글 삭제
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, context: any) {
  const commentId = context.params.commentId;

  try {
    const db = (await clientPromise).db("wearly");
    await db.collection("comments").deleteOne({
      _id: new ObjectId(commentId),
    });

    return NextResponse.json(
      { message: "댓글이 성공적으로 삭제되었습니다." },
      { status: 200 }
    );
  } catch (err) {
    console.error("댓글 삭제 오류:", err);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}

// PATCH: 댓글 수정
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(req: NextRequest, context: any) {
  const commentId = context.params.commentId;

  try {
    const { text } = await req.json();
    const db = (await clientPromise).db("wearly");
    await db.collection("comments").updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { text } }
    );

    return NextResponse.json(
      { message: "댓글이 성공적으로 수정되었습니다." },
      { status: 200 }
    );
  } catch (err) {
    console.error("댓글 수정 오류:", err);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
