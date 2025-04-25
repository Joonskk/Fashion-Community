"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import LogoutButton from '@/app/components/LogoutButton';
import LoginButton from '@/app/components/LoginButton';

const MyPageClient = ({session} : {session : any}) => {

    const [userData, setUserData] = useState<{ name: string, height: string, weight: string } | null>(null)

    useEffect(() => {
        // fetch 호출하여 DB에서 데이터 가져오기
        const fetchUserData = async () => {
        try {
            const response = await fetch('/api/post/edit-profile')
            if (response.ok) {
            const data = await response.json()
            setUserData(data.users[0]) // 첫 번째 유저 정보만 사용한다고 가정
            } else {
            console.error('DB 조회 실패')
            }
        } catch (error) {
            console.error('API 호출 오류:', error)
        }
        }

        fetchUserData()
    }, []) // 컴포넌트 마운트될 때 한 번만 호출

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
                                <div>
                                    <Link href="/mypage/edit">Edit Profile</Link>
                                </div>
                            </div>
                        </div>
                        <div className="follow-button">
                            <button className="bg-black text-white text-[15px] px-[5px] py-[1px] rounded-[10px] mt-[100px] mr-[50px]">
                                Follow
                            </button>
                        </div>
                    </div>

                    <LogoutButton />
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