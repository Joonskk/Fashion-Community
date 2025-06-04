"use client"

import Link from "next/link"

type TabType = "bookmark" | "likes";

type BookmarkNavbarProps = {
    tab: TabType;
    setTab: React.Dispatch<React.SetStateAction<TabType>>;
  }

const BookmarkNavbar = ({tab, setTab} : BookmarkNavbarProps) => {

    const navMenu = [
        { label: "북마크", menu: "bookmark", key: 1 },
        { label: "좋아요", menu: "likes", key: 2 },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 max-w-[750px] mx-auto opacity-95 bg-white text-xl font-bold px-7 border-x border-x-gray-200 border-b border-b-gray-200">
            <div className="my-4 flex justify-between items-center">
                <Link href="/">Wearly</Link>
                <Link href="/"><img src="/icons/Notification.png" className="w-[25px] h-[25px]" /></Link>
            </div>
            <div className="flex text-base">
                {
                    navMenu.map((item) => {
                        return (
                            <button
                            className={`mr-4 h-[32px] cursor-pointer ${item.menu === tab ? "border-b-2" : "border-b-2 border-transparent text-gray-400"}`}
                            onClick={()=>setTab(item.menu as "bookmark" | "likes")}
                            key={item.key}>
                                {item.label}
                            </button>
                        )
                    })
                }
            </div>
        </nav>
    )
}

export default BookmarkNavbar;