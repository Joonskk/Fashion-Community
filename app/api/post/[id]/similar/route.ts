// app/api/post/[id]/similar/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1. Await params before accessing properties (Next.js 15 requirement)
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("wearly");

        // 2. Fetch current post
        const currentPost = await db
        .collection("posts")
        .findOne({ _id: new ObjectId(id) });

        if (!currentPost) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const currentId = new ObjectId(id);
        const items = currentPost.items || [];
        const styles = currentPost.styles || [];
        const colors = currentPost.colors || [];
        const season = currentPost.season;

        // 3. Query posts matching shared attributes (excluding current post)
        const matchConditions: any[] = [];

        if (items.length > 0) matchConditions.push({ items: { $in: items } });
        if (styles.length > 0) matchConditions.push({ styles: { $in: styles } });
        if (colors.length > 0) matchConditions.push({ colors: { $in: colors } });
        if (season) matchConditions.push({ season });

        let query: any = { _id: { $ne: currentId } };

        if (matchConditions.length > 0) {
        query.$or = matchConditions;
        }

        // 4. Fetch similar posts
        const similarPosts = await db
        .collection("posts")
        .find(query)
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();

        return NextResponse.json({
        success: true,
        posts: similarPosts,
        });
    } catch (err) {
        console.error("Error fetching similar posts:", err);
        return NextResponse.json(
        { error: "Failed to fetch similar posts" },
        { status: 500 }
        );
    }
}
