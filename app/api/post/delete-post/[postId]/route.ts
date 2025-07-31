import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE: 게시물 삭제
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, context: any) {
    const postId = context.params.postId;

    try {
        const db = (await clientPromise).db('wearly');

        // Cloudinary에서 사진 삭제
        const post = await db.collection("posts").findOne({_id: new ObjectId(postId)});
        if (!post) {
            return NextResponse.json({ message: "게시물을 찾을 수 없습니다." }, { status: 404 });
        }
        if (post.images && Array.isArray(post.images)) {
            for (const image of post.images) {
              if (image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
              }
            }
        }

        // DB에서 게시물, 댓글, 북마크 삭제
        await db.collection("posts").deleteOne({_id: new ObjectId(postId)})
        await db.collection("comments").deleteMany({postId: postId,})
        await db.collection("bookmarks").deleteMany({postId: postId,})

        return NextResponse.json(
            { message: "게시물이 성공적으로 삭제되었습니다." },
            { status: 200 }
        );
    } catch(err) {
        console.error("게시물 삭제 오류:", err);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}