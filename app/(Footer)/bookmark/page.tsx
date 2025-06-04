"use client"

import StyleCard from "@/app/components/StyleCard";
import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import Filter from "@/app/components/Filter";
import BookmarkNavbar from "@/app/components/BookmarkNavbar";

type Post = {
    _id: string;
    postId: string;
    imageURLs: string[];
    userEmail: string;
}

const Bookmark = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [bookmarks, setBookmarks] = useState<Post[]>([]);
    const [likes, setLikes] = useState<Post[]>([]);
    const [tab, setTab] = useState<"bookmark" | "likes">("bookmark");
    const { email } = useUser();

    useEffect(() => {
        if (!email) return;

        const fetchBookmarks = async () => {
            try {
                const response = await fetch('/api/posts/bookmarks');
                if (response.ok) {
                    const data = await response.json();
                    console.log("post data: ", data);
                    
                    const bookmarkedPosts: Post[] = data.bookmarkedPosts.filter((post: Post) => post.userEmail === email);
                    
                    if(bookmarkedPosts){
                        setBookmarks(bookmarkedPosts);
                        setPosts(bookmarkedPosts); // set "posts" as "bookmarks" as a default
                    } else{
                        console.error('DB 조회 실패');
                    }
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        const fetchLikes = async () => {
            try {
                const response = await fetch('/api/posts/likes', {
                    headers: {
                        'user-email': email
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("liked post data: ", data);
                    setLikes(data.likedPosts);
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        fetchBookmarks();
        fetchLikes();
    },[email])

    useEffect(() => {
        switch(tab){
            case "bookmark":
                setPosts(bookmarks);
                break;
            case "likes":
                setPosts(likes);
                break;
        }
    }, [tab])

    return (
        <>
            <BookmarkNavbar tab={tab} setTab={setTab} />
            <div className="mt-[88px] mb-[100px]">
                <Filter />
                <div className="flex flex-wrap mt-4">
                    {posts.map((post, index) => (
                    <div key={index} className="w-1/2 md:w-1/3">
                        <StyleCard postImageURL={post.imageURLs[0]} postID={post.postId} />
                    </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Bookmark;
