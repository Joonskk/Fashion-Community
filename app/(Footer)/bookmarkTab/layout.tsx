import "@/styles/globals.css";
import BookmarkNavbar from '@/app/components/BookmarkNavbar'
import Filter from "@/app/components/Filter";
import { FeedFilterProvider } from "@/app/context/FeedFilterContext";

export const viewport = {
  scrollRestoration: "manual",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FeedFilterProvider>
      <div className="relative">
          <BookmarkNavbar />
          {/* Navbar가 fixed 이므로, 콘텐츠가 위로 올라붙지 않게 padding-top을 줍니다 */}
          <main className="mt-[88px] mb-[100px]">
            <Filter />
            {children}
          </main>
      </div>
    </FeedFilterProvider>
  );
}
