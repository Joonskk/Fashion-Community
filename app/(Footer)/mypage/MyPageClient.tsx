"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from "@/app/context/UserContext";
import LogoutButton from '@/app/components/LogoutButton';
import LoginButton from '@/app/components/LoginButton';
import StyleCard from "@/app/components/StyleCard";

type User = {
    _id: string;
    name: string;
    height: string;
    weight: string;
    email: string;
    followersCount: number;
    followingCount: number;
}

type Post = {
    _id: string;
    userEmail: string;
    imageURLs: string[];
    description: string;
    likes: string[];
    likesCount: number;
}

const MyPageClient = () => {
    const router = useRouter();

    const { email, session } = useUser();

    const [userData, setUserData] = useState<{ _id: string, name: string, height: string, weight: string, email: string, followersCount: number, followingCount: number } | null>(null)
    const [myPost, setMyPost] = useState<Post[]>([]);
    const userId = userData?._id;

    const handleClick = () => {
        if (!userData) return;
        const query = new URLSearchParams({
            _id: userData._id,
            name: userData.name,
            height: userData.height,
            weight: userData.weight,
            email: userData.email,
            followersCount: userData.followersCount.toString(),
            followingCount: userData.followingCount.toString(),
        }).toString();
        router.push(`/mypage/edit?${query}`);
    }

    useEffect(() => {
        if (!session || !email) return; // 로그인 안돼있으면 바로 return

        // fetch 호출하여 DB에서 데이터 가져오기
        const fetchUserData = async () => {
            try {
                const userEmail: string = email;
                const response = await fetch('/api/post/edit-profile');
                if (response.ok) {
                    const data = await response.json()
                    // console.log("session data: ", data);
                    const foundUser: User = data.users.find((user: { email: string }) => user.email === userEmail);
                    console.log(foundUser);
                    if (foundUser) { // 로그인 시 동작
                        setUserData(foundUser); // 이메일이 일치하는 사용자 데이터 설정
                    } else { // 첫 회원가입 시 동작
                        console.log("Redirecting to Sign Up page...")
                        router.push("/mypage/signup");
                    }
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }
        
        fetchUserData()
    }, [session, email, router])

    useEffect(() => {
        const posts = async () => {
            try {
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json()
                    console.log("post data: ", data);
                    console.log(email);
                    const foundPosts: Post[] = data.posts.filter((post: Post) => post.userEmail === email);
                    console.log("foundPosts:", foundPosts);
                    setMyPost(foundPosts); // 이메일이 일치하는 게시물 설정
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        posts();
    },[session])

    return (
        <div className="h-screen">
            {session ? (
                <div className="flex flex-col">
                    <div className="flex justify-between w-full pl-[50px] border-b border-b-gray-200">
                        <div className="flex max-w-[750px] mt-[50px] pb-[50px]">
                            <img src="/profile-default.png" className="w-[150px] h-[150px] rounded-full" />
                            <div className="ml-[50px]">
                            {userData ? (
                                <>
                                <h1 className="mt-[30px] text-[20px]">{userData.name}</h1>
                                <div className="flex text-gray-500 text-[15px]">
                                    <h2>{userData.height}cm</h2>
                                    <h2 className="ml-[3px]">/</h2>
                                    <h2 className="ml-[3px]">{userData.weight}kg</h2>
                                </div>
                                </>
                            ) : (
                                <div className="text-gray-400 mt-[30px]">정보를 불러오는 중...</div>
                            )}
                                <div className="flex text-[15px] mt-[10px]">
                                <div className="flex items-center">
                                        <button onClick={()=>router.push(`/user/${userId}/follows?tab=followers`)} className="cursor-pointer">팔로워</button>
                                        <h2 className="ml-[6px]">{userData?.followersCount}</h2>
                                    </div>
                                    <div className="flex items-center ml-[20px]">
                                        <button onClick={()=>router.push(`/user/${userId}/follows?tab=following`)} className="cursor-pointer">팔로잉</button>
                                        <h2 className="ml-[6px]">{userData?.followingCount}</h2>
                                    </div>
                                </div>
                                <div className="flex mt-[10px]">
                                    <button onClick={handleClick} className="mr-[20px]">Edit Profile</button>
                                    <LogoutButton />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex absolute top-4 right-4">
                        <Link 
                        href="/mypage/newpost"
                        className="flex items-center justify-center text-[35px] text-black text-center border border-2 border-black rounded-[8px] w-[30px] h-[30px] mr-[20px] opacity-60 hover:opacity-100 hover:bg-black hover:text-white transition"
                        >
                            +
                        </Link>
                        <div className="flex justify-center items-center cursor-pointer opacity-60 hover:opacity-100 transition-all duration-150">
                            <img src="/icons/Menu.png" className="w-[25px] h-[25px]" />
                        </div>
                    </div>
                    <div className="mb-[60px]">
                        <div className="flex flex-wrap">
                            {myPost.map((post, index) => (
                            <div key={index} className="w-1/2 md:w-1/3">
                                <StyleCard postImageURL={post.imageURLs[0]} postID={post._id} />
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="login-form flex flex-col justify-center items-center h-screen">
                    <div className="font-bold text-[15px]">
                        Login to view My Page
                    </div>
                    <LoginButton />
                </div>
            )}
        </div>
    )
}

export default MyPageClient;