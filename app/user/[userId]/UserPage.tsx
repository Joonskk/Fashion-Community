"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import LoginButton from "@/app/components/LoginButton";
import StyleCard from "@/app/components/StyleCard";
import Image from "next/image";

type ImageInfo = {
    public_id: string;
    url: string;
};

type User = {
    _id: string;
    name: string;
    height?: string;
    weight?: string;
    email: string;
    profileImage?: ImageInfo;
    followersCount?: number;
    followingCount?: number;
};

type Post = {
    _id: string;
    userEmail: string;
    images: ImageInfo[];
    description: string;
    likes?: string[];
    likesCount?: number;
};

interface UserPageClientProps {
    initialUser: User;
    initialPosts: Post[];
    userId: string;
}

export default function UserPage({ initialUser, initialPosts, userId,}: UserPageClientProps) {
    const router = useRouter();
    const { email, session, refetchUserData } = useUser();

    const [userData, setUserData] = useState<User>(initialUser);
    const [userPosts, setUserPosts] = useState<Post[]>(initialPosts);
    const [isFollowed, setIsFollowed] = useState<boolean>(false);

    // Redirect to mypage if the viewing user is looking at their own profile
    useEffect(() => {
        if (session && userData.email === email) {
        router.push("/mypage");
        }
    }, [session, email, userData.email, router]);

    // Fetch follow status on load
    useEffect(() => {
        if (!email || !userData.email) return;

        const fetchFollowStatus = async () => {
        try {
            const res = await fetch(
            `/api/follow?sessionUserEmail=${email}&postAuthorEmail=${userData.email}`
            );
            if (res.ok) {
            const data = await res.json();
            setIsFollowed(data.isFollowing);
            }
        } catch (err) {
            console.error("API call error while checking follow status:", err);
        }
        };

        fetchFollowStatus();
    }, [userData.email, email]);

    const handleFollow = async () => {
        try {
        const res = await fetch("/api/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            sessionUserEmail: email,
            postAuthorEmail: userData.email,
            }),
        });

        const data = await res.json();

        const updatedFollowed = data.isFollowing;
        setIsFollowed(updatedFollowed);

        setUserData((prev) => {
            const currentFollowers = prev.followersCount || 0;
            const newFollowersCount = updatedFollowed
            ? currentFollowers + 1
            : currentFollowers - 1;

            return {
            ...prev,
            followersCount: Math.max(0, newFollowersCount),
            };
        });

        refetchUserData();
        } catch (err) {
        console.error("Error during follow operation: ", err);
        }
    };

    if (!session) {
        return (
        <div className="login-form flex flex-col justify-center items-center h-screen">
            <div className="font-bold text-[15px]">Login to view My Page</div>
            <LoginButton />
        </div>
        );
    }

    return (
        <div className="h-screen">
        <div className="flex flex-col">
            <div className="flex justify-between w-full pl-[50px] border-b border-b-gray-200">
            <div className="flex max-w-[750px] mt-[50px] pb-[50px]">
                <Image
                src={userData.profileImage?.url || "/profile-default.png"}
                width={150}
                height={150}
                alt="User Profile Image"
                priority
                className="rounded-full w-[150px] h-[150px] object-cover"
                />
                <div className="ml-[50px]">
                <h1 className="mt-[30px] text-[20px]">{userData.name}</h1>
                <div className="flex text-gray-500 text-[15px]">
                    <h2>{userData.height ? `${userData.height}cm` : "-"}</h2>
                    <h2 className="ml-[3px]">/</h2>
                    <h2 className="ml-[3px]">{userData.weight ? `${userData.weight}kg` : "-"}</h2>
                </div>

                <div className="flex text-[15px] mt-[10px]">
                    <div className="flex items-center">
                    <button
                        onClick={() => router.push(`/user/${userId}/follows?tab=followers`)}
                        className="cursor-pointer"
                    >
                        팔로워
                    </button>
                    <h2 className="ml-[6px]">{userData.followersCount || 0}</h2>
                    </div>
                    <div className="flex items-center ml-[20px]">
                    <button
                        onClick={() => router.push(`/user/${userId}/follows?tab=following`)}
                        className="cursor-pointer"
                    >
                        팔로잉
                    </button>
                    <h2 className="ml-[6px]">{userData.followingCount || 0}</h2>
                    </div>
                </div>
                </div>
            </div>

            <div className="follow-button">
                <button
                className={`mt-[100px] mr-[50px] cursor-pointer ${
                    isFollowed ? "bg-white text-black border-[1px]" : "bg-black text-white"
                } font-bold text-[13px] px-[10px] py-[7px] rounded-lg`}
                onClick={handleFollow}
                >
                {isFollowed ? "팔로잉" : "팔로우"}
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
                {userPosts.map((post) => (
                <div key={post._id} className="w-1/2 md:w-1/3">
                    <StyleCard postImageURL={post.images[0]?.url} postID={post._id} />
                </div>
                ))}
            </div>
            </div>
        </div>
        </div>
    );
}
