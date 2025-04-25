"use server"

import {signOut} from '@/auth'

const LogoutAction = async () => {
    await signOut({ redirectTo: '/home' })
}

export default LogoutAction;