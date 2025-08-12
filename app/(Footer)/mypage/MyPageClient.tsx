"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { signOut } from "next-auth/react";
import { useUser } from "@/app/context/UserContext";
import LoginButton from '@/app/components/LoginButton';
import StyleCard from "@/app/components/StyleCard";
import Image from 'next/image';

type User = {
    _id: string;
    name: string;
    height: string;
    weight: string;
    email: string;
    profileImage: ImageInfo;
    followersCount: number;
    followingCount: number;
}

type Post = {
    _id: string;
    userEmail: string;
    images: ImageInfo[];
    description: string;
    likes: string[];
    likesCount: number;
}

type ImageInfo = {
    url: string;
    public_id: string;
}

const MyPageClient = () => {
    const router = useRouter();

    const { email, session } = useUser();

    const [userData, setUserData] = useState<{ _id: string, name: string, height: string, weight: string, email: string, profileImage: ImageInfo, followersCount: number, followingCount: number } | null>(null)
    const [myPost, setMyPost] = useState<Post[]>([]);
    const userId = userData?._id;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLDivElement>(null);

    const handleEditClick = () => {
        if (!userData) return;
        const query = new URLSearchParams({
            _id: userData._id,
            name: userData.name,
            height: userData.height,
            weight: userData.weight,
            email: userData.email,
            profileImage: JSON.stringify(userData.profileImage),
            followersCount: userData.followersCount.toString(),
            followingCount: userData.followingCount.toString(),
        }).toString();
        router.push(`/mypage/edit?${query}`);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && 
            !menuRef.current.contains(event.target as Node) && 
            menuButtonRef.current &&
            !menuButtonRef.current.contains(event.target as Node)) {
            setMenuOpen(false);
          }
        };
    
        if (menuOpen) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          document.removeEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

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
                    // console.log(foundUser);
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
                    // console.log("post data: ", data);
                    // console.log(email);
                    const foundPosts: Post[] = data.posts.filter((post: Post) => post.userEmail === email);
                    // console.log("foundPosts:", foundPosts);
                    setMyPost(foundPosts); // 이메일이 일치하는 게시물 설정
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        posts();
    },[session, email])

    return (
        <div className="h-screen relative">
            {session ? (
                <div className="flex flex-col">
                    <div className="flex justify-between w-full pl-[50px] border-b border-b-gray-200">
                        <div className="flex max-w-[750px] mt-[50px] pb-[50px]">
                            <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                                <Image
                                    src={userData?.profileImage.url || "/profile-default.png"}
                                    alt="User Profile Image"
                                    width={150}
                                    height={150}
                                    priority
                                    className="object-cover w-full h-full"
                                />
                            </div>
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
                                    <button onClick={()=>router.push(`/user/${userId}/follows?tab=followers`)} className="flex items-center cursor-pointer active:opacity-50">
                                        <div className="text-gray-500">팔로워</div>
                                        <h2 className="ml-[6px] font-bold">{userData?.followersCount}</h2>
                                    </button>
                                    <button onClick={()=>router.push(`/user/${userId}/follows?tab=following`)} className="flex items-center cursor-pointer active:opacity-50 ml-[20px]">
                                        <div className="text-gray-500">팔로잉</div>
                                        <h2 className="ml-[6px] font-bold">{userData?.followingCount}</h2>
                                    </button>
                                </div>
                                <div className="flex mt-[10px]">
                                    <button 
                                    onClick={handleEditClick} 
                                    className="px-[15px] py-[5px] text-[14px] cursor-pointer font-bold bg-gray-100 hover:bg-gray-200 rounded-lg active:text-gray-500 active:scale-97 mr-[10px]"
                                    >
                                        프로필 편집
                                    </button>
                                    <div 
                                    className="px-[15px] py-[5px] text-[14px] cursor-pointer font-bold bg-gray-100 hover:bg-gray-200 rounded-lg active:text-gray-500 active:scale-97"
                                    onClick={() => signOut({ callbackUrl: "/home" })}
                                    >
                                        로그아웃
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex absolute top-4 right-4">
                        <Link // 새 게시물 버튼
                        href="/mypage/newpost"
                        className="flex items-center justify-center text-[35px] text-black text-center border border-2 border-black rounded-[8px] w-[30px] h-[30px] mr-[20px] opacity-60 hover:opacity-100 hover:bg-black hover:text-white active:scale-90 transition"
                        >
                            +
                        </Link>

                        <div // 메뉴창 토글 버튼
                        ref={menuButtonRef}
                        className="flex justify-center items-center cursor-pointer opacity-60 hover:opacity-100 active:scale-90 transition-all duration-100"
                        onClick={(e) => {
                            e.stopPropagation(); // 메뉴 버튼 클릭 이벤트가 외부로 안 퍼지게
                            setMenuOpen((prev) => !prev);
                        }}
                        >
                            <Image src="/icons/Menu.png" width={25} height={25} alt="Menu Icon" />
                        </div>
                        {menuOpen && (
                        <div
                        ref={menuRef}
                        className="absolute top-[40px] right-0 w-[250px] bg-white shadow-lg border border-gray-100 rounded-xl p-[10px] z-100"
                        onClick={(e) => e.stopPropagation()} // 메뉴 내부 클릭 시 닫힘 방지
                        >
                            <div 
                            className="p-[15px] text-[15px] cursor-pointer bg-white hover:bg-gray-100 rounded-xl active:text-gray-500"
                            onClick={()=>router.push('/mypage/settings')}
                            >
                                설정
                            </div>
                            <div 
                            className="p-[15px] text-[15px] cursor-pointer bg-white hover:bg-gray-100 rounded-xl active:text-gray-500"
                            onClick={()=>router.push('/mypage/activity')}
                            >
                                내 활동
                            </div>
                            <div 
                            className="p-[15px] text-[15px] cursor-pointer bg-white hover:bg-gray-100 rounded-xl active:text-gray-500"
                            onClick={()=>router.push('/mypage/settings')}
                            >
                                모드 전환
                            </div>
                            <div 
                            className="p-[15px] text-[15px] cursor-pointer bg-white hover:bg-gray-100 rounded-xl active:text-gray-500"
                            onClick={() => signOut({ callbackUrl: "/home" })}
                            >
                                로그아웃
                            </div>
                        </div>
                        )}
                    </div>
                    <div className="mb-[60px]">
                        <div className="flex flex-wrap">
                            {myPost.map((post, index) => (
                            <div key={index} className="w-1/2 md:w-1/3">
                                <StyleCard postImageURL={post.images[0].url} postID={post._id} />
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