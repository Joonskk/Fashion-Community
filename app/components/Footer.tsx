"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Footer = () => {
    const pathname = usePathname();

    const menuItems = [
        { href: "/home", home: true, label: "홈", icon: "/icons/Home.png", selectedIcon: "/icons/Home-Selected.png", key: 1},
        { href: "/search", label: "검색", icon: "/icons/Search.png", selectedIcon: "/icons/Search-Selected.png", key: 2},
        { href: "/bookmark", label: "북마크", icon: "/icons/Bookmark.png", selectedIcon: "/icons/Bookmark-Selected.png", key: 3},
        { href: "/mypage", label: "MY", icon: "/icons/MyPage.png", selectedIcon: "/icons/MyPage-Selected.png", key: 4}
    ]

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white ">
            <div className="max-w-[750px] mx-auto flex justify-around border-t border-t-gray-200 border-x border-x-gray-200">
            {menuItems.map((item) => {
                const isActive = item.home
                ? pathname === "/" || pathname.startsWith("/home")
                : pathname.startsWith(item.href);

                return (
                    isActive ?
                    <Link href={item.href} className="w-1/4 h-[60px] flex items-center justify-center" key={item.key}>
                        <div className="flex flex-col items-center">
                            <Image src={item.selectedIcon} width={18} height={18} alt="Selected Footer Icons" />
                            <p className="mt-1 text-[11px] font-bold">{item.label}</p>
                        </div>
                    </Link>
                        :
                    <Link href={item.href} className="w-1/4 h-[60px] flex items-center justify-center" key={item.key}>    
                        <div className="flex flex-col items-center">
                            <Image src={item.icon} width={18} height={18} alt="Unselected Footer Icons" />
                            <p className="mt-1 text-[11px]">{item.label}</p>
                        </div>
                    </Link>
                )
            })}
            </div>
        </div>
    )
}

export default Footer;