import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest){
    const { searchParams } = new URL(req.url);
    const sessionUserId = searchParams.get('userId');

    if(!sessionUserId) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db('wearly');

        const user = await db.collection('users').findOne({
            _id: new ObjectId(sessionUserId)
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userName = user.name;
        const followersCount = user.followersCount;
        const followingCount = user.followingCount;

        const followersEmails = user.followers || [];
        const followingEmails = user.following || [];

        const followers = await db.collection('users').find({
            email: {$in: followersEmails}
        })
        .project({_id: 1, name: 1, email: 1, profileImage: 1})
        .toArray();
        
        const following = await db.collection('users').find({
            email: {$in: followingEmails}
        })
        .project({_id: 1, name: 1, email: 1, profileImage: 1})
        .toArray();

        return NextResponse.json({userName, followers, following, followersCount, followingCount});
    } catch(err) {
        console.error('DB 불러오기 에러:', err);
        return NextResponse.json({ error: 'DB 조회 오류' }, { status: 500 })
    }
}