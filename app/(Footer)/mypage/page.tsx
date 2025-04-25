import {auth} from '@/auth'
import MyPageClient from "./MyPageClient"

const MyPage = async () => {
    const session = await auth();

    return <MyPageClient session={session} />
}

export default MyPage