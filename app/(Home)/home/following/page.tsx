// app/(main)/home/following/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Path to your NextAuth config options
import clientPromise from "@/lib/mongodb";
import StyleCard from "@/app/components/StyleCard";
import { redirect } from "next/navigation";

interface ImageInfo {
  public_id: string;
  url: string;
}

interface Post {
  _id: string;
  userEmail: string;
  sex: string;
  images: ImageInfo[];
  description?: string;
  likes?: string[];
  likesCount?: number;
}

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
  const client = await clientPromise;
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

  // 4. Build query for posts written by followed users
  const query: Record<string, unknown> = {
    userEmail: { $in: followingList },
  };

  if (sex && sex !== "all") {
    query.sex = sex;
  }

  // 5. Fetch posts
  const rawPosts = await db
    .collection("posts")
    .find(query, {
      projection: { _id: 1, userEmail: 1, sex: 1, images: 1, description: 1, likes: 1, likesCount: 1, createdAt: 1 },
    })
    .sort({ createdAt: -1 })
    .toArray();

  const posts: Post[] = rawPosts.map((post) => ({
    _id: post._id.toString(),
    userEmail: post.userEmail,
    sex: post.sex,
    images: post.images,
    description: post.description,
    likes: post.likes || [],
    likesCount: post.likesCount || 0,
  }));

  return (
    <div>
      <div className="flex flex-wrap mt-4">
        {posts.map((post, index) => (
          <div key={post._id} className="w-1/2 md:w-1/3">
            <StyleCard 
              postImageURL={post.images[0]?.url} 
              postID={post._id} 
              priority={index === 0} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
