import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import PostView from "./PostView";

interface PageProps {
  params: Promise<{ postId: string }> | { postId: string };
}

async function getPostData(postId: string) {
  try {
    if (!ObjectId.isValid(postId)) return null;

    const client = await clientPromise;
    const db = client.db("wearly");

    // 1. Fetch Post Document
    const post = await db.collection("posts").findOne({ _id: new ObjectId(postId) });
    if (!post) return null;

    // 2. Fetch Author User Document
    const author = await db.collection("users").findOne(
      { email: { $regex: `^${post.userEmail.trim()}$`, $options: "i" } },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          height: 1,
          weight: 1,
          sex: 1,
          profileImage: 1,
          followersCount: 1,
          followingCount: 1,
        },
      }
    );

    // Convert MongoDB ObjectIds to JSON-safe strings
    return {
      post: JSON.parse(JSON.stringify(post)),
      author: author ? JSON.parse(JSON.stringify(author)) : null,
    };
  } catch (error) {
    console.error("Error fetching post data on server:", error);
    return null;
  }
}

export default async function PostPage({ params }: PageProps) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await params;
  const data = await getPostData(resolvedParams.postId);

  if (!data || !data.post) {
    notFound();
  }

  return <PostView initialPost={data.post} initialAuthor={data.author} />;
}
