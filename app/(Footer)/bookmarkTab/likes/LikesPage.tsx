"use client"

import StyleCard from "@/app/components/StyleCard";
import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import { useFeedFilter } from "@/app/context/FeedFilterContext";


type Post = {
    _id: string;
    userEmail: string;
    sex: string;
    images: ImageInfo[];
    description: string;
    likes: string[],
    likesCount: number,
}

type ImageInfo = {
    public_id: string;
    url: string;
};

const LikesPage = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const { filters } = useFeedFilter();
    const { email } = useUser();

    useEffect(() => {
        if(!email) return;

        const fetchPosts = async () => {
            try {
                const params = new URLSearchParams({});
          
                if (filters.sex !== "all") {
                    params.append("sex", filters.sex);
                }

                const response = await fetch(`/api/posts/likes?${params.toString()}`, {
                    headers: {
                        'user-email': email
                    }
                });
                if (response.ok) {
                    const data = await response.json()
                    console.log("post data: ", data);
                    setPosts(data.likedPosts);
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        fetchPosts();
    },[email, filters])

    return (
        <div className="">
            <div className="flex flex-wrap mt-4">
                {posts.map((post, index) => (
                <div key={index} className="w-1/2 md:w-1/3">
                  {post.images[0]?.url ? (
                    <StyleCard postImageURL={post.images[0].url} postID={post._id} />
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
};

export default LikesPage;