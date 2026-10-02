import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { normalizeTag, MAX_HASHTAGS_PER_POST } from '@/lib/constants';

// Helper function to extract hashtags from raw description text
export function extractHashtags(text: string): string[] {
    if (!text) return [];
    const matches = text.match(/#[\w\u00C0-\u024F]+/g);
    if (!matches) return [];
    return matches.map((tag) => tag.slice(1).toLowerCase());
}

export async function POST(req: Request) {

    const body = await req.json();
    const { email, authorName, sex, images, description, styles, items, season, likes, likesCount } = body;
    
    try {
        // 1. Extract hashtags written in description (if any)
        const captionHashtags = extractHashtags(description);

        // 2. Combine caption tags with selected button styles
        const combinedRawStyles = [...styles, ...captionHashtags];

        // 3. Normalize all tags against the allowed 20 taxonomy styles & remove duplicates
        const normalizedStyles = combinedRawStyles
        .map((tag: string) => normalizeTag(tag))
        .filter((tag: string | null): tag is string => tag !== null);

        const uniqueStyles = Array.from(new Set(normalizedStyles));

        // 4. Enforce strict cap (Max 3 tags per post)
        const finalStyles = uniqueStyles.slice(0, MAX_HASHTAGS_PER_POST);

        const db = (await clientPromise).db('wearly');
        const result = await db.collection('posts').insertOne({
            userEmail: email,
            authorName,
            sex,
            images,
            description,
            styles: finalStyles, // Capped to max 3 valid taxonomy tags
            items,
            season,
            likes,
            likesCount,
            createdAt: new Date(),
        })
        return NextResponse.json({ success: true });
    } catch(err) {
        console.error('DB 저장 중 에러:', err)
        return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
    }
}