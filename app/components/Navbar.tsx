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
        <nav className="bg-white text-xl font-bold">
            <div className="my-4 flex justify-between items-center">
                <Link href="/">Wearly</Link>
                <Link href="/"><img src="/Notification.png" className="w-[px] h-[25px]" /></Link>
            </div>
            <div className="flex text-base border-b border-b-gray-200">
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