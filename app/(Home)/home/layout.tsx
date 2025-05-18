import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from '@/app/components/Navbar'

export const viewport = {
  scrollRestoration: "manual",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
        <Navbar />
        {/* Navbar가 fixed 이므로, 콘텐츠가 위로 올라붙지 않게 padding-top을 줍니다 */}
        <main>  
            {children}
        </main>
    </div>
  );
}
