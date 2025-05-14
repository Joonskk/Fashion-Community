import Link from "next/link";

const Post = () => {
    return (
        <div className="flex flex-col w-full relative mb-[60px]">
            <Link href="/mypage" className="mt-[20px] mb-[10px] ml-[20px] w-[30px] h-[30px] flex justify-center items-center">
                <img src="/icons/BackArrow.png" className="w-[30px] h-[30px]" />
            </Link>
            <div className=""> {/* 게시물 div */}
                <div className="w-full h-[60px] flex items-center"> {/* 유저 정보 */}
                    <img src="/profile-default.png" className="rounded-full w-[40px] h-[40px] m-[10px]" /> {/* 유저 프로필 사진 */}
                    <div> {/* 유저 아이디, 키, 몸무게 */}
                        <div className="font-bold text-[17px] h-[25px]">
                            user id
                        </div>
                        <div className="text-[14px] h-[25px]">
                            180cm 74kg
                        </div>
                    </div>
                    <div className="ml-auto mr-[10px] cursor-pointer bg-sky-500 font-bold text-white text-[13px] px-[10px] py-[7px] rounded-lg" > {/* 팔로우 버튼 */}
                        팔로우
                    </div>
                </div>
                <div> {/* 사진 */}
                    <img src="/styles/Style3.jpeg" className="w-full h-auto object-contain" />
                </div>
                <div className="w-full h-[50px] flex items-center"> {/* 좋아요, 댓글, 북마크 */}
                    <div className="w-[25px] h-[25px] ml-[20px]">
                        <img src="/icons/heart-unclicked.png" />
                    </div>
                    <div className="w-[25px] h-[25px] ml-[25px]">
                        <img src="/icons/comment.png" />
                    </div>
                    <div className="w-[25px] h-[25px] ml-[25px]">
                        <img src="/icons/bookmark-unclicked.png" />
                    </div>
                </div>
                <div className="ml-[20px] mb-[40px]"> {/* 설명 */}
                    <div className="font-bold inline-block mr-[10px]">user id</div>
                    <div className="inline">This is a long description that should wrap to the next line and start from the left edge of the container.</div>
                    <div className="text-gray-400">19시간 전</div>
                </div>
            </div>
        </div>
    )
}

export default Post;