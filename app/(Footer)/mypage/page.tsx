import {auth, signIn, signOut} from '@/auth'

const MyPage = async () => {
    const session = await auth();

    return (
        <div className="h-screen">
            {session && session?.user ? (
                <div>
                    <form action={async () => {
                        "use server"
        
                        await signOut({ redirectTo: "/home" })
                    }} >
                        <button type="submit">
                            Logout
                        </button>
                    </form>
                </div>
            ) : (
                <div className="login-form flex justify-center items-center h-screen">
                    <form action={async () => {
                        "use server"
        
                        await signIn('google')
                    }} >
                        <button type="submit" className="google__btn">
                            <i className="fa fa-google"></i>
                            Sign in with Google
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default MyPage