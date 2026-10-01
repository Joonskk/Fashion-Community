// app/(main)/home/ranking/page.tsx
import clientPromise from "@/lib/mongodb";
import StyleCard from "@/app/components/StyleCard";

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

interface RankingPageProps {
  searchParams: Promise<{ sex?: string }>;
}

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const { sex } = await searchParams;

  const client = await clientPromise;
  const db = client.db('wearly');

  const query: Record<string, unknown> = {};
  if (sex && sex !== "all") {
    query.sex = sex;
  }

  // Sort by highest likes count for Ranking feed
  const rawPosts = await db.collection('posts').find(query, {
    projection: { _id: 1, userEmail: 1, sex: 1, images: 1, description: 1, likes: 1, likesCount: 1, createdAt: 1 }
  }).sort({ likesCount: -1 }).toArray();

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
