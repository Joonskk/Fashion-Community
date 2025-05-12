import Link from "next/link";

const Post = () => {
    return (
        <div className="flex flex-col w-full relative">
            <Link href="/mypage">
                <img src="/icons/BackArrow.png" className="absolute top-6 left-6 w-[20px] h-[20px]" />
            </Link>
            
        </div>
    )
}

export default Post;