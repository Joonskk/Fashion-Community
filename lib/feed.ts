import { ObjectId, type Db, type Document, type Sort } from "mongodb";

export const PAGE_SIZE = 20;

export type SortMode = "newest" | "likes";
const SORT_FIELD = { newest: "createdAt", likes: "likesCount" } as const;

export type Cursor = { key: string | number; id: string };

// Only the fields a feed card needs (no description AI fields, no embedding)
const FEED_PROJECTION = { _id: 1, userEmail: 1, sex: 1, images: 1, likes: 1, likesCount: 1, createdAt: 1 };

// Bookmark <-> short URL-safe string
export function encodeCursor(c: Cursor): string {
    return Buffer.from(JSON.stringify(c)).toString("base64url");
}

export function decodeCursor(s: string): Cursor | null {
    try {
        const c = JSON.parse(Buffer.from(s, "base64url").toString());
        if ((typeof c.key !== "string" && typeof c.key !== "number") || !ObjectId.isValid(c.id)) return null;
        return c;
    } catch {
        return null; // garbage cursor -> caller returns 400
    }
}

// Does this bookmark's key fit the sort mode? (newest = date string, likes = number)
export function cursorFitsMode(c: Cursor, mode: SortMode): boolean {
    if (mode === "newest") {
        return typeof c.key === "string" && !Number.isNaN(Date.parse(c.key));
    }
    return typeof c.key === "number";
}

// One page of posts, newest first, starting after `cursor`
export async function getFeedPage(db: Db, mode: SortMode, filter: Document, cursor: Cursor | null) {
    const field = SORT_FIELD[mode]; // "createdAt" or "likesCount"
    const query: Document = { ...filter };

    if (cursor) {
        const key = mode === "newest" ? new Date(cursor.key as string) : cursor.key;
        const id = new ObjectId(cursor.id);
        query.$or = [
            { [field]: { $lt: key } },
            { [field]: key, _id: { $lt: id } },
        ];
    }

    const docs = await db.collection("posts")
        .find(query)
        .project(FEED_PROJECTION)
        .sort({ [field]: -1, _id: -1 } as Sort)
        .limit(PAGE_SIZE + 1) // ask for one extra
        .toArray();

    const hasMore = docs.length > PAGE_SIZE;
    const posts = docs.slice(0, PAGE_SIZE);
    const last = posts[posts.length - 1];

    const nextCursor = hasMore
        ? encodeCursor({ key: mode === "newest" ? last.createdAt.toISOString() : last.likesCount, id: last._id.toString(), })
        : null;

    return { posts, nextCursor };
}