"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

type TabType = "bookmark" | "likes";

type BookmarkNavbarProps = {
  tab: TabType;
  setTab: (newTab: TabType) => void;
};

const BookmarkNavbar = ({ tab, setTab }: BookmarkNavbarProps) => {
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as TabType) || tab;

  const navMenu = [
    { label: "북마크", menu: "bookmark", key: 1 },
    { label: "좋아요", menu: "likes", key: 2 },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 max-w-[750px] mx-auto opacity-95 bg-white text-xl font-bold px-7 border-x border-x-gray-200 border-b border-b-gray-200">
      <div className="my-4 flex justify-between items-center">
        <Link href="/">Wearly</Link>
        <Link href="/">
          <Image src="/icons/Notification.png" width={25} height={25} alt="Notification Icon" />
        </Link>
      </div>
      <div className="flex text-base">
        {navMenu.map((item) => (
          <button
            key={item.key}
            className={`mr-4 h-[32px] cursor-pointer ${
              item.menu === currentTab
                ? "border-b-2"
                : "border-b-2 border-transparent text-gray-400"
            }`}
            onClick={() => setTab(item.menu as TabType)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BookmarkNavbar;
