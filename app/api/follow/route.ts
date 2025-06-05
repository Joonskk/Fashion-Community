import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){

    const body = await req.json();
    const { sessionUserEmail, postAuthorEmail } = body;

    if (!sessionUserEmail || !postAuthorEmail) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        const db = (await clientPromise).db('wearly');

        const sessionUser = await db.collection("users").findOne({ email: sessionUserEmail });
        const authorUser = await db.collection("users").findOne({ email: postAuthorEmail });

        if (!sessionUser || !authorUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isFollowing = sessionUser.following?.includes(postAuthorEmail);

        if (isFollowing) { // 언팔로우 처리
            await db.collection("users").updateOne(
              { email: sessionUserEmail },
              { $pull: { following: postAuthorEmail } }
            );
      
            await db.collection("users").updateOne(
              { email: postAuthorEmail },
              { $pull: { followers: sessionUserEmail } }
            );
        } else { // 팔로우 처리
            await db.collection("users").updateOne(
              { email: sessionUserEmail },
              { $addToSet: { following: postAuthorEmail } }
            );
      
            await db.collection("users").updateOne(
              { email: postAuthorEmail },
              { $addToSet: { followers: sessionUserEmail } }
            );
        }

        return NextResponse.json({ isFollowing: !isFollowing });
    } catch(err) {
        console.error(err);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

export async function GET(req: NextRequest){
    const { searchParams } = new URL(req.url);
    const sessionUserEmail = searchParams.get('sessionUserEmail');
    const postAuthorEmail = searchParams.get('postAuthorEmail');

    if (!sessionUserEmail || !postAuthorEmail) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

    try {
        const client = await clientPromise;
        const db = client.db('wearly');
        
        const user = await db.collection('users').findOne({
            email: sessionUserEmail
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isFollowing = user.following?.includes(postAuthorEmail);
      
        return NextResponse.json({ isFollowing })
    } catch(err) {
        console.error('DB 불러오기 에러:', err);
        return NextResponse.json({ error: 'DB 조회 오류' }, { status: 500 })
    }
}