import {auth} from '@/auth'
import MyPageClient from "./MyPageClient"

const MyPage = async () => {
    const session = await auth();
    console.log("session: ", session);

    return <MyPageClient session={session} />
}

export default MyPage