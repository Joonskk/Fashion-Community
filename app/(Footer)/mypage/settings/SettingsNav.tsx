import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SettingsNav = () => {
    const pathname = usePathname();
    const lastSegment = pathname.split("/").pop();

    return (
        <div>
            <div className="font-bold text-[20px] my-[20px] px-[25px]">설정</div>
            <div className="mx-[10px]">
                <div className="text-gray-500 text-[13px] px-[15px]">계정 관련</div>
                <Link href={'/mypage/settings/accounts/edit'} className={`${lastSegment === "edit" ? "bg-gray-100 hover:bg-gray-200" : "bg-white hover:bg-gray-100"} flex items-center gap-2 p-3 text-[15px] cursor-pointer rounded-xl active:text-gray-500`}>
                    <Image 
                        src="/icons/MyPage.png" 
                        width={18} 
                        height={18} 
                        alt="Selected Footer Icons" 
                        className="flex-shrink-0" 
                    />
                    <span>프로필 편집</span>
                </Link>
                <Link href={'/mypage/settings/accounts/delete'} className={`${lastSegment === "delete" ? "bg-gray-100 hover:bg-gray-200" : "bg-white hover:bg-gray-100"} flex items-center gap-2 p-3 text-[15px] cursor-pointer rounded-xl active:text-gray-500`}>
                    <Image 
                        src="/icons/Remove.png" 
                        width={18} 
                        height={18} 
                        alt="Selected Footer Icons" 
                        className="flex-shrink-0" 
                    />
                    <span>계정 탈퇴</span>
                </Link>
                <div className="flex items-center gap-2 p-3 text-[15px] cursor-pointer bg-white hover:bg-gray-100 rounded-xl active:text-gray-500">
                    <Image 
                        src="/icons/Notification.png" 
                        width={18} 
                        height={18} 
                        alt="Selected Footer Icons" 
                        className="flex-shrink-0" 
                    />
                    <span>알림</span>
                </div>
            </div>
        </div>
    )
}

export default SettingsNav;