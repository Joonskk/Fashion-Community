"use client"

import Link from "next/link";
import { useState, useEffect } from "react";

type Post = {
    _id: string;
    userEmail: string;
    body: {
        imageURLs: string[],
        description: string;
    };
}

type User = {
    name: string;
    height: string;
    weight: string;
    email: string;
}

const PostView = ({postId} : {postId : string}) => {

    const [post, setPost] = useState<Post | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [images, setImages] = useState<string[]>([]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === images?.length - 1 ? images?.length - 1 : prev + 1));
    };

    useEffect(() => {
        // console.log(postId)
        const fetchPost = async () => {
            try {
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json()
                    // console.log("post page data: ", data)
                    const foundPost: Post = data.posts.find((post: Post) => post._id === postId);
                    // console.log("foundPost:", foundPost);
                    setPost(foundPost); // 아이디가 일치하는 게시물 설정
                } else {
                console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        fetchPost();
    }, [postId])  // postId가 변경될 때마다 실행

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/post/edit-profile');
                if(response.ok){
                    const userData = await response.json();
                    // console.log("userData:", userData);
                    const foundUser: User = userData.users.find((user: User) => user.email === post?.userEmail);
                    // console.log("foundUser:", foundUser);
                    setUser(foundUser); // post 정보의 이메일과 일치하는 user 색출 후 저장
                } else {
                    console.error('DB 조회 실패')
                }
            } catch (error) {
                console.error('API 호출 오류:', error)
            }
        }

        if (post) {
            fetchUser();
            setImages(post.body.imageURLs);
        }
    }, [post])  // post가 변경될 때마다 실행

    useEffect(()=>{
        console.log(images);
    }, [images])

    return (
        <div className="flex flex-col w-full relative mb-[60px]">
            <Link href="/" className="mt-[20px] mb-[10px] ml-[20px] w-[30px] h-[30px] flex justify-center items-center">
                <img src="/icons/BackArrow.png" className="w-[30px] h-[30px]" />
            </Link>
            <div className=""> {/* 게시물 div */}
                <div className="w-full h-[60px] flex items-center"> {/* 유저 정보 */}
                    <img src="/profile-default.png" className="rounded-full w-[40px] h-[40px] m-[10px]" /> {/* 유저 프로필 사진 */}
                    <div> {/* 유저 아이디, 키, 몸무게 */}
                        <div className="font-bold text-[17px] h-[25px]">
                            {user?.name}
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
                    <div className="relative w-[300px] h-[400px] mx-auto flex items-center justify-center mt-[20px]">
                        <img
                            src={images ? images[currentIndex] : ""}
                            alt={`Preview ${currentIndex}`}
                            className="w-full h-full object-cover rounded-lg shadow-lg"
                        />
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white opacity-20 hover:opacity-80 text-black font-bold px-1 py-1 rounded-full shadow">
                            ◀
                        </button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white opacity-20 hover:opacity-80 text-black font-bold px-1 py-1 rounded-full shadow">
                            ▶
                        </button>
                    </div>
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
                    <div className="font-bold inline-block mr-[10px]">{user?.name}</div>
                    <div className="inline">This is a long description that should wrap to the next line and start from the left edge of the container.</div>
                    <div className="text-gray-400">19시간 전</div>
                </div>
            </div>
        </div>
    );
}

export default PostView;