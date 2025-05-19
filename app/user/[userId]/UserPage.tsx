"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import { useUser } from "@/app/context/UserContext";
import LoginButton from '@/app/components/LoginButton';
import StyleCard from "@/app/components/StyleCard";

type User = {
    _id: string;
    name: string;
    height: string;
    weight: string;
    email: string;
}

type Post = {
    _id: string;
    userEmail: string;
    imageURLs: string[];
    description: string;
    likes: string[];
    likesCount: number;
}

const UserPage = () => {

    const router = useRouter();

    const params = useParams();
    const userId = params?.userId as string;

    const { email, session } = useUser();

    const [userData, setUserData] = useState<{ name: string, height: string, weight: string, email: string } | null>(null)
    const [userPost, setUserPost] = useState<Post[]>([]);

    useEffect(() => {
        if (!session) return; // 로그인 안돼있으면 바로 return

        // fetch 호출하여 DB에서 데이터 가져오기
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/post/edit-profile');
                if (response.ok) {
                    const data = await response.json()
                    // console.log("session data: ", data);
                    const foundUser: User = data.users.find((user: { _id: string }) => user._id === userId);
                    console.log(foundUser);
                    if (foundUser) {
                        setUserData(foundUser); // 아이디가 일치하는 사용자 데이터 설정
                    }
                    if (foundUser.email === email) {
                        router.push('/mypage')
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
        if (!session || !userData) return;

        const posts = async () => {
            try {
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json()
                    console.log("post data: ", data);
                    const foundPosts: Post[] = data.posts.filter((post: Post) => post.userEmail === userData?.email);
                    console.log("foundPosts:", foundPosts);
                    setUserPost(foundPosts); // 이메일이 일치하는 게시물 설정
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        posts();
    },[session, userData])

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
                                    <h2>Follower</h2>
                                    <h2 className="ml-[20px]">Following</h2>
                                </div>
                            </div>
                        </div>
                        <div className="follow-button">
                            <button className="bg-black text-white text-[15px] px-[5px] py-[1px] rounded-[10px] mt-[100px] mr-[50px]">
                                Follow
                            </button>
                        </div>
                    </div>
                    <div className="flex absolute top-4 right-4">
                        <div className="flex justify-center items-center cursor-pointer opacity-60 hover:opacity-100 transition-all duration-150">
                            <img src="/icons/Option.png" className="w-[25px] h-[25px]" />
                        </div>
                    </div>
                    <div className="mb-[60px]">
                        <div className="flex flex-wrap">
                            {userPost.map((post, index) => (
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

export default UserPage;