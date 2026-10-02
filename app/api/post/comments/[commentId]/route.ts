import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

type RouteParams = {
    params: Promise<{ commentId: string }>;
};

// DELETE: 댓글 삭제
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, {params} : RouteParams) {
  try {
    const { commentId } = await params;

    if (!commentId || !ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { message: "Invalid Comment ID" },
        { status: 400 }
      );
    }

    const db = (await clientPromise).db("wearly");
    const result = await db.collection("comments").deleteOne({
      _id: new ObjectId(commentId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "삭제할 댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

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
export async function PATCH(req: NextRequest, {params} : RouteParams) {
  try {
    const { commentId } = await params;
    const { text } = await req.json();

    if (!commentId || !ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { message: "Invalid Comment ID" },
        { status: 400 }
      );
    }

    const db = (await clientPromise).db("wearly");
    const result = await db.collection("comments").updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { text } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "수정할 댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "댓글이 성공적으로 수정되었습니다." },
      { status: 200 }
    );
  } catch (err) {
    console.error("댓글 수정 오류:", err);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
