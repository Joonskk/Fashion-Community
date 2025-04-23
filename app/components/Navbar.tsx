"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const Navbar = () => {
    const pathname = usePathname();

    const navMenu = [
        { href: "/home/recommend", label: "추천", key: 1 },
        { href: "/home/ranking", label: "스타일랭킹", key: 2 },
        { href: "/home/following", label: "팔로잉", key: 3 }
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 max-w-[750px] mx-auto opacity-95 bg-white text-xl font-bold px-7 border-x border-x-gray-200 border-b border-b-gray-200">
            <div className="my-4 flex justify-between items-center">
                <Link href="/">Wearly</Link>
                <Link href="/"><img src="/icons/Notification.png" className="w-[px] h-[25px]" /></Link>
            </div>
            <div className="flex text-base">
                {
                    navMenu.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            isActive 
                            ?
                            <Link href={item.href} className="mr-4 h-[32px] border-b-2" key={item.key}>{item.label}</Link>
                            :
                            <Link href={item.href} className="mr-4 h-[32px] text-gray-400" key={item.key}>{item.label}</Link>
                        )
                    })
                }
            </div>
        </nav>
    )
}

export default Navbar