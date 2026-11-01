// 홈 화면용 게시물 받아오기 API

import { NextRequest, NextResponse } from 'next/server'
import { getClient } from "@/lib/mongodb";
import type { Document } from 'mongodb';
import { getFeedPage, decodeCursor, type Cursor, type SortMode } from "@/lib/feed";

export async function GET(req:NextRequest) {
    const client = await getClient();
    const db = client.db('wearly');

    const { searchParams } = new URL(req.url);
    const sortParam = searchParams.get("sort"); // newest || likes || following
    const sexParam = searchParams.get("sex");
    const authorParam = searchParams.get("author"); // My Page: one user's posts
    const cursorParam = searchParams.get("cursor");
    const userEmail = req.headers.get("user-email");

    // 1. Read the bookmark. No cursor means page 1
    let cursor: Cursor | null = null;
    if (cursorParam) {
        cursor = decodeCursor(cursorParam);
        if (!cursor) {
            return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
        }
    }

    // 2. Build the filter (same rules as before)
    const filter: Document = {};
    if (sexParam && sexParam !== "all") filter.sex = sexParam;
    if (authorParam) filter.userEmail = authorParam;

    if (sortParam === "following") {
        if (!userEmail) {
        return NextResponse.json({ error: "Missing user email in headers" }, { status: 400 });
        }

        const user = await db.collection("users").findOne({ email: userEmail });
        if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        filter.userEmail = { $in: user.following || [] };
    }

    // 3. One page + the bookmark for the next one
    const mode: SortMode = sortParam === "likes" ? "likes" : "newest";
    const { posts, nextCursor } = await getFeedPage(db, mode, filter, cursor);

    return NextResponse.json({ posts, nextCursor });
}