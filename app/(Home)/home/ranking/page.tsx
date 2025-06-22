"use client"

import Filter from "@/app/components/Filter";
import StyleCard from "@/app/components/StyleCard";
import { useState, useEffect } from "react";

type Post = {
    _id: string;
    userEmail: string;
    imageURLs: string[];
    description: string;
    likes: string[],
    likesCount: number,
}

const Ranking = () => {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const posts = async () => {
            try {
                const response = await fetch('/api/posts?sort=likes');
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
    },[])

    return (
        <div className="mt-[88px] mb-[100px]">
            <Filter />
            <div className="flex flex-wrap mt-4">
                {posts.map((post, index) => (
                <div key={index} className="w-1/2 md:w-1/3">
                    <StyleCard postImageURL={post.imageURLs[0]} postID={post._id} />
                </div>
                ))}
            </div>
        </div>
    );
};

export default Ranking;