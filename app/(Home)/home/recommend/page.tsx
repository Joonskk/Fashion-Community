// app/(main)/home/recommend/page.tsx
import clientPromise from "@/lib/mongodb";
import StyleCard from "@/app/components/StyleCard";

// 1. Types for post objects
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

// 2. Next.js Page Props
interface RecommendPageProps {
    searchParams: Promise<{ sex?: string }>;
}

export default async function RecommendPage({ searchParams }: RecommendPageProps) {
    // Read URL search params directly (e.g. ?sex=female)
    const { sex } = await searchParams;

    // Connect to MongoDB using your existing native driver
    const client = await clientPromise;
    const db = client.db('wearly');

    // Build query exact same way as your API route
    const query: Record<string, unknown> = {};
    if (sex && sex !== "all") {
        query.sex = sex;
    }

    // Fetch raw posts from 'wearly' DB & 'posts' collection
    const rawPosts = await db.collection('posts').find(query, {
        projection: { _id: 1, userEmail: 1, sex: 1, images: 1, description: 1, likes: 1, likesCount: 1, createdAt: 1 }
    }).sort({ createdAt: -1 }).toArray();

    // Convert MongoDB ObjectId to String for Client serialization
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
                priority={index === 0} // Preloads LCP image only for 1st card
                />
            </div>
            ))}
        </div>
        </div>
    );
}
