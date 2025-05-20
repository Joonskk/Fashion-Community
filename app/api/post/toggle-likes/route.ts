import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request){

    const body = await req.json();

    const { postId, userEmail } = body;

    const _id = new ObjectId(postId as string);

    try {
        const db = (await clientPromise).db('wearly');
        const post = await db.collection('posts').findOne({ _id });
        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        const alreadyLiked  = post.likes.includes(userEmail);
        const updatedLikes = alreadyLiked
            ? post.likes.filter((email: string) => email !== userEmail)
            : [...post.likes, userEmail];

        await db.collection('posts').updateOne(
            { _id },
            {
                $set: {
                    likes: updatedLikes,
                    likesCount: updatedLikes.length,
                }
            }
        )
        
        return NextResponse.json({
            liked: !alreadyLiked,
            likesCount: updatedLikes.length,
        });

    } catch(err) {
        console.error(err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}