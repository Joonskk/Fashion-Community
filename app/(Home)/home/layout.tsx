import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from '@/app/components/Navbar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <Navbar />
        {children}
    </>
  );
}
