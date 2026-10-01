// app/(main)/likes/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
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

interface LikesPageProps {
    searchParams: Promise<{ sex?: string }>;
}

export default async function LikesPage({ searchParams }: LikesPageProps) {
    const { sex } = await searchParams;

    // 1. Authenticate user on the server
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
        redirect("/mypage");
    }

    // 2. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("wearly");

    // 3. Build query for posts liked by the user
    const query: Record<string, unknown> = {
        likes: userEmail, // Matches posts where userEmail is included in the likes array
    };

    if (sex && sex !== "all") {
        query.sex = sex;
    }

    // 4. Fetch liked posts
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

    if (posts.length === 0) {
        return (
        <div className="p-8 text-center text-gray-500">
            좋아요를 누른 게시물이 없습니다.
        </div>
        );
    }

    return (
        <div>
        <div className="flex flex-wrap mt-4">
            {posts.map((post, index) => (
            <div key={post._id} className="w-1/2 md:w-1/3">
                {post.images[0]?.url ? (
                <StyleCard 
                    postImageURL={post.images[0].url} 
                    postID={post._id} 
                    priority={index === 0} 
                />
                ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    이미지 없음
                </div>
                )}
            </div>
            ))}
        </div>
        </div>
    );
}
