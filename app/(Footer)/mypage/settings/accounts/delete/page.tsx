"use client"

import { useState } from "react";
import { signOut } from "next-auth/react";

const Delete = () => {

    const AGREEMENT_TEXT = "계정 탈퇴에 동의합니다.";
    const [inputValue, setInputValue] = useState("");

    const isMatch = inputValue === AGREEMENT_TEXT;

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!isMatch) return;

        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
            })

            if(res.ok){
                alert("계정이 정상적으로 삭제되었습니다.");
                // 필요 시 로그아웃 후 리다이렉트
                signOut({ callbackUrl: "/" });
            } else {
                const data = await res.json();
                alert("삭제 실패: " + data.error);
            }

        } catch(err) {
            console.error(err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    }

    return (
        <div className="p-4">
            <div className="font-bold text-[20px] mb-[10px]">계정 탈퇴</div>
            <div className="text-gray-700 text-[15px] mb-[70px]">계정 탈퇴를 진행하기 전에 아래 항목을 꼭 확인해주세요.</div>

            <div className="text-gray-800 text-[15px] mb-[15px]">탈퇴 후 개인정보는 모두 삭제됩니다.</div>
            <div className="grid grid-cols-[150px_1fr] mb-6 border-t border-b border-gray-200">
                <div className="p-3 text-gray-600 text-[15px] text-left font-medium border-b border-r border-gray-200">프로필 정보</div>
                <div className="p-3 text-gray-600 text-[15px] text-left border-b border-gray-200">이메일, 이름 등 유저 정보 전부 삭제</div>
                <div className="p-3 text-gray-600 text-[15px] text-left font-medium border-r border-gray-200">유저 활동</div>
                <div className="p-3 text-gray-600 text-[15px] text-left">댓글, 좋아요, 게시물 등 모든 활동 삭제</div>
            </div>


            <form onSubmit={handleDelete} className="mt-[100px] flex flex-col">
                <div className="text-gray-800 text-[15px]">문장을 그대로 입력하세요:</div>
                <div className="text-[15px] text-red-600 mb-[15px]">&quot;계정 탈퇴에 동의합니다.&quot;</div>
                <input
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-[250px] h-[30px] p-[5px] text-[15px] text-red-600 border border-red-600 rounded-md focus:outline-none" 
                />
                <button
                type="submit"
                disabled={!isMatch}
                className={`w-[60px] mt-[30px] px-[5px] py-[3px] font-bold text-[15px] rounded-md border-2
                    ${isMatch ? "bg-red-600 text-white border-red-600 hover:bg-red-400 cursor-pointer" : "bg-white text-red-400 border-red-400"}
                `}
                >
                    제출
                </button>
            </form>
        </div>
    )
}

export default Delete;