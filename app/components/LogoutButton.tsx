"use client"

import { signOut } from "next-auth/react";

const LogoutButton = () => {
    return (
        <button className="cursor-pointer" onClick={() => signOut({ callbackUrl: "/home" })}>
            Logout
        </button>
    )
}

export default LogoutButton;