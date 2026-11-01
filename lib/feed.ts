import { ObjectId, type Db, type Document } from "mongodb";

export const PAGE_SIZE = 20;

export type Cursor = { createdAt: string; id: string };

// Only the fields a feed card needs (no description AI fields, no embedding)
const FEED_PROJECTION = { _id: 1, userEmail: 1, sex: 1, images: 1, likes: 1, likesCount: 1, createdAt: 1 };

// Bookmark <-> short URL-safe string
export function encodeCursor(c: Cursor): string {
    return Buffer.from(JSON.stringify(c)).toString("base64url");
}

export function decodeCursor(s: string): Cursor | null {
    try {
        const c = JSON.parse(Buffer.from(s, "base64url").toString());
        if (typeof c.createdAt !== "string" || !ObjectId.isValid(c.id)) return null;
        return c;
    } catch {
        return null; // garbage cursor -> caller returns 400
    }
}

// One page of posts, newest first, starting after `cursor`
export async function getNewestPage(db: Db, filter: Document, cursor: Cursor | null) {
    const query: Document = { ...filter };

    if (cursor) {
        const createdAt = new Date(cursor.createdAt);
        const id = new ObjectId(cursor.id);
        query.$or = [
            { createdAt: { $lt: createdAt } },               // older than the bookmark
            { createdAt: createdAt, _id: { $lt: id } },      // same time, smaller id
        ];
    }

    const docs = await db.collection("posts")
        .find(query)
        .project(FEED_PROJECTION)
        .sort({ createdAt: -1, _id: -1 })
        .limit(PAGE_SIZE + 1) // ask for one extra
        .toArray();

    const hasMore = docs.length > PAGE_SIZE;
    const posts = docs.slice(0, PAGE_SIZE);
    const last = posts[posts.length - 1];

    const nextCursor = hasMore
        ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last._id.toString() })
        : null;

    return { posts, nextCursor };
}