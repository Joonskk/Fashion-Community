import { notFound } from "next/navigation";
import { getClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import UserPageClient from "./UserPage";
import { getFeedPage } from "@/lib/feed";

interface PageProps {
  params: Promise<{ userId: string }> | { userId: string };
}

async function getUserPageData(userId: string) {
  try {
    if (!ObjectId.isValid(userId)) return null;

    const client = await getClient();
    const db = client.db("wearly");

    // 1. Fetch target user by ObjectId
    const userDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!userDoc) return null;

    // 2. Page 1 of this user's posts (newest first)
    const { posts, nextCursor } = await getFeedPage(db, "newest", { userEmail: userDoc.email }, null);

    return {
      user: JSON.parse(JSON.stringify(userDoc)),
      posts: posts.map((p) => ({ _id: p._id.toString(), imageUrl: p.images[0]?.url })),
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching user page data on server:", error);
    return null;
  }
}

export default async function UserPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getUserPageData(resolvedParams.userId);

  if (!data || !data.user) {
    notFound();
  }

  return (
    <UserPageClient
      initialUser={data.user}
      initialPosts={data.posts}
      initialCursor={data.nextCursor}
      userId={resolvedParams.userId}
    />
  );
}
