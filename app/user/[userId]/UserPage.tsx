"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
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
    public_id: string;
    url: string;
};

const UserPage = () => {

    const router = useRouter();

    const params = useParams();
    const userId = params?.userId as string; // 해당 프로필 페이지 유저

    const { email, session } = useUser();

    const [userData, setUserData] = useState<{ name: string, height: string, weight: string, email: string, followersCount: number, followingCount: number } | null>(null) // 해당 프로필 페이지 유저
    const [userPost, setUserPost] = useState<Post[]>([]);
    const [isFollowed, setIsFollowed] = useState<boolean>(false);
    const [postUserProfileImage, setPostUserProfileImage] = useState<string>("");

    const handleFollow = async () => {
        console.log("handleFollow executed")
        try {
            const res = await fetch('/api/follow', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionUserEmail: email,
                    postAuthorEmail: userData?.email,
                })
            })

            const data = await res.json();
            console.log("✅ DB 저장 성공:", data);

            const updatedFollowed = data.isFollowing;
            setIsFollowed(updatedFollowed);

            setUserData(prev => {
                if(!prev) return prev;

                const newFollowersCount = updatedFollowed
                ? prev.followersCount + 1
                : prev.followersCount - 1;

                return {
                    ...prev,
                    followersCount: Math.max(0, newFollowersCount), // 음수 방지
                };
            })
        } catch(err) {
            console.error("팔로우 중 오류 발생: ", err)
        }
    }

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
                        setPostUserProfileImage(foundUser.profileImage.url);
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
    }, [session, email, router, userId])

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

    useEffect(() => { // 팔로우 여부
        if (!email || !userData) return;

        const fetchFollow = async () => {
            try {
                const res = await fetch(`/api/follow?sessionUserEmail=${email}&postAuthorEmail=${userData.email}`);
                if(res.ok) {
                    const data = await res.json();
                    setIsFollowed(data.isFollowing);
                }
            } catch(err) {
                console.error('API 호출 오류:', err);
            }
        }
        
        fetchFollow();
    }, [userData, email])
    

    return (
        <div className="h-screen">
            {session ? (
                <div className="flex flex-col">
                    <div className="flex justify-between w-full pl-[50px] border-b border-b-gray-200">
                        <div className="flex max-w-[750px] mt-[50px] pb-[50px]">
                            <Image src={postUserProfileImage || "/profile-default.png"} width={150} height={150} alt="User Profile Image" priority className="rounded-full w-[150px] h-[150px] object-cover" />
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
                            </div>
                        </div>
                        <div className="follow-button">
                            <button 
                            className={`mt-[100px] mr-[50px] cursor-pointer ${isFollowed ? "bg-white text-black border-[1px]" : "bg-black text-white"} font-bold text-[13px] px-[10px] py-[7px] rounded-lg`}
                            onClick={handleFollow}
                            > {/* 팔로우 버튼 */}
                                {isFollowed ? "팔로잉" :"팔로우"}
                            </button>
                        </div>
                    </div>
                    <div className="flex absolute top-4 right-4">
                        <div className="flex justify-center items-center cursor-pointer opacity-60 hover:opacity-100 transition-all duration-150">
                            <Image src="/icons/Option.png" width={25} height={25} alt="Option Icon" />
                        </div>
                    </div>
                    <div className="mb-[60px]">
                        <div className="flex flex-wrap">
                            {userPost.map((post, index) => (
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

export default UserPage;