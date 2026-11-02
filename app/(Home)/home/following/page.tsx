// app/(main)/home/following/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Path to your NextAuth config options
import { getClient } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { getFeedPage } from "@/lib/feed";
import InfiniteFeed, { type FeedCard } from "@/app/components/InfiniteFeed";

interface FollowingPageProps {
  searchParams: Promise<{ sex?: string }>;
}

export default async function FollowingPage({ searchParams }: FollowingPageProps) {
  const { sex } = await searchParams;

  // 1. Get user session directly on the server (No client-side fetch or extra roundtrips!)
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/mypage");
  }

  // 2. Connect to MongoDB using native driver
  const client = await getClient();
  const db = client.db("wearly");

  // 3. Fetch current user's following list directly from DB
  const currentUser = await db.collection("users").findOne({ email: userEmail });
  const followingList: string[] = currentUser?.following || [];

  if (followingList.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        You are not following anyone yet.
      </div>
    );
  }

  // 4. Posts by people you follow, newest first, page 1 only
  const filter: Record<string, unknown> = { userEmail: { $in: followingList } };
  if (sex && sex !== "all") filter.sex = sex;

  const { posts, nextCursor } = await getFeedPage(db, "newest", filter, null);

  const cards: FeedCard[] = posts.map((p) => ({
    _id: p._id.toString(),
    imageUrl: p.images[0]?.url,
  }));

  const query = `sort=following&sex=${sex ?? "all"}`;

  return <InfiniteFeed key={query} initialPosts={cards} initialCursor={nextCursor} query={query} />;
}