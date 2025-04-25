"use client"

import LogoutAction from './LogoutAction'

const LogoutButton = () => {
    return (
        <form action={LogoutAction} >
            <button type="submit" className="cursor-pointer">
                Logout
            </button>
        </form>
    )
}

export default LogoutButton;