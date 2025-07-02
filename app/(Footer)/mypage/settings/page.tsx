"use client"

import { useRouter} from "next/navigation";
import Image from "next/image";

const Settings = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col w-full relative mb-[60px]">
            <button 
            onClick={() => router.back()}
            className="cursor-pointer mt-[20px] mb-[10px] ml-[20px] w-[30px] h-[30px] flex justify-center items-center">
                <Image src="/icons/BackArrow.png" width={30} height={30} alt="Back Arrow" className="w-[30px] h-[30px]" />
            </button>
        </div>
    )
}

export default Settings;