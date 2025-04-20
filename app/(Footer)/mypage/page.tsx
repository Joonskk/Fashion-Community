import {auth, signIn, signOut} from '@/auth'

const MyPage = async () => {
    const session = await auth();

    return (
        <div>
            mypage
            {session && session?.user ? (
                <form action={async () => {
                    "use server"
    
                    await signOut({ redirectTo: "/home" })
                }} >
                    <button type="submit">
                        Logout
                    </button>
                </form>
            ) : (
                <form action={async () => {
                    "use server"
    
                    await signIn('google')
                }} >
                    <button type="submit">
                        Login
                    </button>
                </form>
            )}
        </div>
    )
}

export default MyPage