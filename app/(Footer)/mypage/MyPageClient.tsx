"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import LogoutButton from '@/app/components/LogoutButton';
import LoginButton from '@/app/components/LoginButton';
import StyleCard from "@/app/components/StyleCard";

type User = {
    name: string;
    height: string;
    weight: string;
    email: string;
}

type Post = {
    userEmail: string;
    body: {
        imageURLs: string[];
        description: string;
    };
}

const MyPageClient = ({session} : {session : any}) => {

    const [userData, setUserData] = useState<{ name: string, height: string, weight: string, email: string } | null>(null)
    const [myPost, setMyPost] = useState<Post[]>([]);

    useEffect(() => {
        if (!session?.user) return; // 로그인 안돼있으면 바로 return

        // fetch 호출하여 DB에서 데이터 가져오기
        const fetchUserData = async () => {
            try {
                const userEmail: string = session.user.email;
                {/*
                const response = await fetch('/api/post/edit-profile', {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                    name: '홍길동',
                    height: '180',
                    weight: '75',
                    }),
                });
                */}
                const response = await fetch('/api/post/edit-profile');
                if (response.ok) {
                    const data = await response.json()
                    // console.log("session data: ", data);
                    const foundUser: User = data.users.find((user: { email: string }) => user.email === userEmail);
                    // console.log(foundUser);
                    if (foundUser) { // 로그인 시 동작
                        setUserData(foundUser); // 이메일이 일치하는 사용자 데이터 설정
                    } else { // 첫 회원가입 시 동작
                        console.log("Redirecting to Sign Up page...")
                        window.location.href = "/mypage/signup"; // redirect("") 는 server side 에서만 동작함
                    }
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }
        
        fetchUserData()
    }, [session])

    useEffect(() => {
        const posts = async () => {
            try {
                const userEmail: string = session.user.email;
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json()
                    console.log("post data: ", data)
                    const foundPosts: Post[] = data.posts.filter((post: Post) => post.userEmail === userEmail);
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
    },[])

    return (
        <div className="h-screen">
            {session && session?.user ? (
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
                                <div className="flex mt-[10px]">
                                    <Link href="/mypage/edit" className="mr-[20px]">Edit Profile</Link>
                                    <LogoutButton />
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
                                <StyleCard postImageURL={post.body.imageURLs[0]} />
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