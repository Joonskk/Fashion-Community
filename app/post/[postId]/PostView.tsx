"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { create } from "domain";

type Post = {
    _id: string;
    userEmail: string;
    imageURLs: string[],
    description: string,
    likes: string[],
    likesCount: number,
    createdAt: string,
}

type User = {
    _id: string;
    name: string;
    height: string;
    weight: string;
    email: string;
}

const PostView = () => {

    const router = useRouter();

    const params = useParams();
    const postId = params?.postId as string;

    const { email } = useUser();

    const [post, setPost] = useState<Post | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [likes, setLikes] = useState<string[]>([]);
    const [likesCount, setLikesCount] = useState<number>(0);
    const [createdAt, setCreatedAt] = useState<string>("");

    const [liked, setLiked] = useState<boolean>(false);

    const [currentIndex, setCurrentIndex] = useState(0);

    const moveToUserPage = () => {
        router.push(`/user/${user?._id}`);
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
        console.log(user);
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === images?.length - 1 ? images?.length - 1 : prev + 1));
    };

    const toggleLike = async () => {
        const likedAfterAction = !liked;
        setLiked(likedAfterAction);
        setLikesCount(likedAfterAction ? likesCount + 1 : likesCount -1);

        try{
            const res = await fetch('/api/post/toggle-likes',{
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    userEmail: email,
                }),
            })

            const data = await res.json();
            setLikesCount(data.likesCount);
        } catch(err) {
            console.error("Failed to toggle likes: ", err)
            setLiked(!likedAfterAction);
            setLikesCount(likedAfterAction ? likesCount - 1 : likesCount + 1);
        }
    }

    const getTimeAgo = (dateStr: string) => {
        const now = new Date();
        const past = new Date(dateStr);
        const diffMs = now.getTime() - past.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHrs / 24);
    
        if (diffSec < 60) return `${diffSec}초 전`;
        if (diffMin < 60) return `${diffMin}분 전`;
        if (diffHrs < 24) return `${diffHrs}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
    
        return past.toLocaleDateString(); // 너무 오래전이면 날짜로
    };
    

    useEffect(() => {
        // console.log(postId)
        const fetchPost = async () => {
            try {
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json()
                    // console.log("post page data: ", data)
                    const foundPost: Post = data.posts.find((post: Post) => post._id === postId);
                    // console.log("foundPost:", foundPost);
                    setPost(foundPost); // 아이디가 일치하는 게시물 설정
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        fetchPost();
    }, [postId])  // postId가 변경될 때마다 실행

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/post/edit-profile');
                if(response.ok){
                    const userData = await response.json();
                    const foundUser: User = userData.users.find((user: User) => user.email === post?.userEmail);
                    // console.log("foundUser:", foundUser);
                    setUser(foundUser); // post 정보의 이메일과 일치하는 user 색출 후 저장
                } else {
                    console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        if (post) {
            console.log(post);
            fetchUser();
            setImages(post.imageURLs);
            setLikes(post.likes || []);
            setLikesCount(post.likesCount || 0);
            setLiked(post.likes?.includes(email) ?? false); // ?? 는 좌측 값이 null / undefined 일 때 우측 값을 사용한다는 의미
            setCreatedAt(post.createdAt);
        }
    }, [post])  // post가 변경될 때마다 실행

{/*
    useEffect(()=>{
        console.log(images);
    }, [images])

    useEffect(()=>{
        console.log("liked: ",liked);
        console.log("likesCount: ", likesCount);
    }, [liked])
*/}

    return (
        <div className="flex flex-col w-full relative mb-[60px]">
            <Link href="/" className="mt-[20px] mb-[10px] ml-[20px] w-[30px] h-[30px] flex justify-center items-center">
                <img src="/icons/BackArrow.png" className="w-[30px] h-[30px]" />
            </Link>
            <div className=""> {/* 게시물 div */}
                <div className="w-full h-[60px] flex items-center"> {/* 유저 정보 */}
                    <img src="/profile-default.png" className="rounded-full w-[36px] h-[36px] m-[10px] cursor-pointer" onClick={moveToUserPage} /> {/* 유저 프로필 사진 */}
                    <div> {/* 유저 아이디, 키, 몸무게 */}
                        <div className="font-bold text-[16px] h-[22px] cursor-pointer" onClick={moveToUserPage}>
                            {user?.name}
                        </div>
                        <div className="text-[13px] h-[20px]">
                            {user?.height}cm · {user?.weight}kg
                        </div>
                    </div>
                    {
                        user?.email === email ?
                        <></>
                        :
                        <div className="ml-auto mr-[10px] cursor-pointer bg-sky-500 font-bold text-white text-[13px] px-[10px] py-[7px] rounded-lg" > {/* 팔로우 버튼 */}
                            팔로우
                        </div>
                    }
                </div>
                <div className="relative w-full aspect-[3/4] mx-auto flex items-center justify-center"> {/* 사진 */}
                    <img
                        src={images[currentIndex]}
                        alt={`Preview ${currentIndex}`}
                        className="w-full h-full object-cover"
                    />
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white opacity-20 hover:opacity-80 text-black font-bold px-1 py-1 rounded-full shadow">
                        ◀
                    </button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white opacity-20 hover:opacity-80 text-black font-bold px-1 py-1 rounded-full shadow">
                        ▶
                    </button>
                </div>
                <div className="w-full h-[50px] flex items-center"> {/* 좋아요, 댓글, 북마크 */}
                    <div className="w-[25px] h-[25px] ml-[20px] cursor-pointer" onClick={toggleLike} >
                        <img src={`/icons/heart-${liked ? "clicked" : "unclicked"}.png`} />
                    </div>
                    <div className="w-[25px] h-[25px] ml-[25px]">
                        <img src="/icons/comment.png" />
                    </div>
                    <div className="w-[25px] h-[25px] ml-[25px]">
                        <img src="/icons/bookmark-unclicked.png" />
                    </div>
                </div>
                <div className="ml-[20px] font-bold text-[15px]">
                    {likesCount} likes
                </div>
                <div className="ml-[20px] mb-[40px]"> {/* 설명 */}
                    <div className="font-bold inline-block mr-[10px]">{user?.name}</div>
                    <div className="inline">{post?.description}</div>
                    <div className="text-gray-400">{createdAt && getTimeAgo(createdAt)}</div>
                </div>
            </div>
        </div>
    );
}

export default PostView;