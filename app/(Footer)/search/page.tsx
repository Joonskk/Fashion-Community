"use client"

import { useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

export default function Search() {

    const { userData } = useUser();
    const router = useRouter();

    useEffect(()=>{
        if(!userData){
            router.push("/mypage");
            return;
        }
    })

    return (
        <div>
            Search
        </div>
    )
}