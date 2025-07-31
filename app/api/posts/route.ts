// 홈 화면용 게시물 받아오기 API

import { NextRequest, NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb";
import type { Sort } from 'mongodb';

export async function GET(req:NextRequest) {
    const client = await clientPromise;
    const db = client.db('wearly');

    const { searchParams } = new URL(req.url);
    const sortParam = searchParams.get("sort"); // newest || likes || following
    const userEmail = req.headers.get("user-email");

    let sortOption: Sort = { createdAt: -1}; // newest
    if(sortParam == "likes"){
        sortOption = { likesCount: -1 }; // likes
    }

    let query = {};

    // "팔로잉한 유저들" 필터
    if (sortParam === "following") {
        if (!userEmail) {
        return NextResponse.json({ error: "Missing user email in headers" }, { status: 400 });
        }

        const user = await db.collection("users").findOne({ email: userEmail });
        if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const followingList = user.following || [];

        query = { userEmail: { $in: followingList } };
    }

    const posts = await db.collection('posts').find(query, {
        projection: { _id: 1, userEmail: 1, images: 1, description: 1, likes: 1, likesCount: 1, createdAt: 1 }
    }).sort(sortOption).toArray()
  
    return NextResponse.json({ posts })
}