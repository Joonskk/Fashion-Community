"use client"

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type User = {
    _id: string;
    name: string;
    email: string;
}

const Follows = () => {

    const router = useRouter();
    const params = useParams();
    const userId = params?.userId as string;
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const isTabValid = tabParam === "followers" || tabParam === "following";
    const [tab, setTab] = useState<"followers" | "following" | null>(isTabValid ? tabParam : null);

    const [userName, setUserName] = useState<string>("");
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);

    useEffect(() => {
        if(!userId) return;

        const fetchFollow = async () => {
            try {
                const res = await fetch(`/api/follow/list?userId=${userId}`);
                if(res.ok) {
                    const data = await res.json();
                    setUserName(data.userName);
                    setFollowers(data.followers);
                    setFollowing(data.following);
                    setFollowersCount(data.followersCount);
                    setFollowingCount(data.followingCount);
                }
            } catch(err) {
                console.error('API 호출 오류:', err);
            }
        }

        fetchFollow();
    }, [userId])

    return (
        <div>
            <div className="relative flex">
                <button 
                onClick={() => router.back()}
                className="cursor-pointer mt-[20px] mb-[10px] ml-[20px] w-[30px] h-[30px] z-[1] flex justify-center items-center">
                    <img src="/icons/BackArrow.png" className="w-[30px] h-[30px]" />
                </button>
                <div className="absolute w-full flex justify-center items-center h-[30px] mt-[20px]">
                    <h1 className="font-bold">{userName}</h1>
                </div>
            </div>
            <div className="mt-4 flex justify-evenly border-b border-gray-200">
                <button 
                className={`font-bold w-[50%] h-[50px] cursor-pointer ${tab === "followers" ? "border-b-2 text-black" : "text-gray-300"}`}
                onClick={()=>setTab("followers")}
                >
                    팔로워
                </button>
                <button 
                className={`font-bold w-[50%] h-[50px] cursor-pointer ${tab === "following" ? "border-b-2 text-black" : "text-gray-300"}`}
                onClick={()=>setTab("following")}
                >
                    팔로잉
                </button>
            </div>

            <div>
                {tab === "followers" ? 
                followers.map((user)=>(
                    <li
                    key={user._id}
                    className="flex items-center justify-between px-[10px] py-[5px] cursor-pointer active:bg-gray-100"
                    onClick={() => router.push(`/user/${user._id.toString()}`)}
                    >
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300" />
                        <span className="text-sm">{user.name}</span>
                        </div>
                        <button className="text-sm text-black cursor-pointer">프로필</button>
                    </li>
                ))
                :
                following.map((user)=>(
                    <li
                    key={user._id}
                    className="flex items-center justify-between px-[10px] py-[5px] cursor-pointer active:bg-gray-100"
                    onClick={() => router.push(`/user/${user._id.toString()}`)}
                    >
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300" />
                        <span className="text-sm">{user.name}</span>
                        </div>
                        <button className="text-sm text-black cursor-pointer">프로필</button>
                    </li>
                ))
                }
            </div>
        </div>
    )
}

export default Follows;