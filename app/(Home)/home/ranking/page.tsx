"use client"

import StyleCard from "@/app/components/StyleCard";
import { useState, useEffect } from "react";
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

const Ranking = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const { filters } = useFeedFilter();

    useEffect(() => {
        const posts = async () => {
            try {
                const params = new URLSearchParams({
                    sort: "likes",
                });
          
                if (filters.sex !== "all") {
                    params.append("sex", filters.sex);
                }
                
                const response = await fetch(`/api/posts?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json()
                    console.log("post data: ", data)
                    setPosts(data.posts);
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        posts();
    },[filters])

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

export default Ranking;