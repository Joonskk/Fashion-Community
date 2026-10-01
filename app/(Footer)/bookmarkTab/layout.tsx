import "@/styles/globals.css";
import BookmarkNavbar from '@/app/components/BookmarkNavbar';
import Filter from "@/app/components/Filter";
import { Suspense } from "react";

export const viewport = {
  scrollRestoration: "manual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      <BookmarkNavbar />
      <main className="mt-[88px] mb-[100px]">
        <Suspense fallback={<div className="h-[56px]" />}>
          <Filter />
        </Suspense>
        {children}
      </main>
    </div>
  );
}
