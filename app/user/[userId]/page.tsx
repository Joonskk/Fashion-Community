import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import UserPageClient from "./UserPage";

interface PageProps {
  params: Promise<{ userId: string }> | { userId: string };
}

async function getUserPageData(userId: string) {
  try {
    if (!ObjectId.isValid(userId)) return null;

    const client = await clientPromise;
    const db = client.db("wearly");

    // 1. Fetch target user by ObjectId
    const userDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!userDoc) return null;

    // 2. Fetch all posts created by this user
    const postsDocs = await db
      .collection("posts")
      .find({ userEmail: userDoc.email })
      .sort({ createdAt: -1 })
      .toArray();

    return {
      user: JSON.parse(JSON.stringify(userDoc)),
      posts: JSON.parse(JSON.stringify(postsDocs)),
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
      userId={resolvedParams.userId}
    />
  );
}
