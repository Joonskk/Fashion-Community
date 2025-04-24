import {auth, signIn, signOut} from '@/auth'

const MyPage = async () => {
    const session = await auth();

    return (
        <div className="h-screen">
            {session && session?.user ? (
                <div className="flex flex-col">
                    <div className="flex justify-between w-full pl-[50px] border-b border-b-gray-200">
                        <div className="flex max-w-[750px] mt-[50px] pb-[50px]">
                            <img src="/profile-default.png" className="w-[150px] h-[150px] rounded-full" />
                            <div className="ml-[50px]">
                                <h1 className="mt-[40px] text-[20px]">user name</h1>
                                <div className="flex">
                                    <h2 className="text-[15px]">Follower</h2>
                                    <h2 className="text-[15px] ml-[20px]">Following</h2>
                                </div>
                            </div>
                        </div>
                        <div className="follow-button">
                            <button className="bg-black text-white text-[15px] px-[5px] py-[1px] rounded-[10px] mt-[100px] mr-[50px]">
                                Follow
                            </button>
                        </div>
                    </div>

                    <form action={async () => {
                        "use server"
        
                        await signOut({ redirectTo: "/home" })
                    }} >
                        <button type="submit" className="cursor-pointer">
                            Logout
                        </button>
                    </form>
                </div>
            ) : (
                <div className="login-form flex flex-col justify-center items-center h-screen">
                    <div className="font-bold text-[15px]">
                        Login to view My Page
                    </div>
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