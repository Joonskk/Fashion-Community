// app/(main)/home/recommend/page.tsx
import { getClient } from "@/lib/mongodb";
import { getFeedPage } from "@/lib/feed";
import InfiniteFeed, { type FeedCard } from "@/app/components/InfiniteFeed";

interface RecommendPageProps {
    searchParams: Promise<{ sex?: string }>;
}

export default async function RecommendPage({ searchParams }: RecommendPageProps) {
    // Read URL search params directly (e.g. ?sex=female)
    const { sex } = await searchParams;

    // Connect to MongoDB using your existing native driver
    const client = await getClient();
    const db = client.db('wearly');

    const filter: Record<string, unknown> = {};
    if (sex && sex !== "all") filter.sex = sex;

    // Page 1 only, rendered on the server
    const { posts, nextCursor } = await getFeedPage(db, "newest", filter, null);

    // Only plain data can go to a client component
    const cards: FeedCard[] = posts.map((p) => ({
        _id: p._id.toString(),
        imageUrl: p.images[0]?.url,
    }));

    const query = `sort=newest&sex=${sex ?? "all"}`;
    
    return <InfiniteFeed key={query} initialPosts={cards} initialCursor={nextCursor} query={query} />;
}
