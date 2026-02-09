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

const Following = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const { filters } = useFeedFilter();
    const { email } = useUser();

    useEffect(() => {
        if(!email) return;

        const posts = async () => {
            try {
                const params = new URLSearchParams({
                    sort: "following",
                });
          
                if (filters.sex !== "all") {
                    params.append("sex", filters.sex);
                }

                const response = await fetch(`/api/posts?${params.toString()}`, {
                    headers: {
                        'user-email': email
                    }
                });
                if (response.ok) {
                    const data = await response.json()
                    console.log("post data: ", data);
                    setPosts(data.posts);
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        posts();
    },[email, filters])

    return (
        <div className="">
            <div className="flex flex-wrap mt-4">
                {posts.map((post, index) => (
                <div key={index} className="w-1/2 md:w-1/3">
                    <StyleCard postImageURL={post.images[0].url} postID={post._id} />
                </div>
                ))}
            </div>
        </div>
    );
};

export default Following;