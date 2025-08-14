"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const BackArrow = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button 
            onClick={() => router.back()}
            className="cursor-pointer mt-[20px] mb-[10px] ml-[20px] w-[30px] h-[30px] flex justify-center items-center">
            <Image src="/icons/BackArrow.png" width={30} height={30} alt="Back Arrow" className="w-[30px] h-[30px]" />
        </button>
  );
};

export default BackArrow;
