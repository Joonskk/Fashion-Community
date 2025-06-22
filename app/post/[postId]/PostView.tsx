"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useRef } from "react";
import { X, ArrowUp } from "lucide-react";
import Image from "next/image";

type Post = {
    _id: string;
    userEmail: string;
    imageURLs: string[],
    description: string,
    likes: string[],
    likesCount: number,
    createdAt: string,
}

type User = {
    _id: string;
    name: string;
    height?: string;
    weight?: string;
    email?: string;
    following?: string[];
    follower?: string[];
}

type Comment = {
    _id?: string;
    postId?: string;
    userEmail?: string;
    userName: string;
    text: string;
    createdAt: string;
}

const PostView = () => {

    const router = useRouter();

    const params = useParams();
    const postId = params?.postId as string;

    const { name, email } = useUser();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [post, setPost] = useState<Post | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [likesCount, setLikesCount] = useState<number>(0);
    const [createdAt, setCreatedAt] = useState<string>("");

    const [liked, setLiked] = useState<boolean>(false);
    const [showComments, setShowComments] = useState<boolean>(false);
    const [comment, setComment] = useState<string>("");
    const [commentsList, setCommentsList] = useState<Comment[]>([]);
    const [isEditingComment, setIsEditingComment] = useState<boolean>(false);
    const [bookmarked, setBookmarked] = useState<boolean>(false);
    const [isFollowed, setIsFollowed] = useState<boolean>(false);

    const [commentId, setCommentId] = useState<string | undefined>("");
    const [showCommentMenu, setShowCommentMenu] = useState<{[key : string] : boolean}>({});

    const [currentIndex, setCurrentIndex] = useState(0);

    const moveToUserPage = () => {
        router.push(`/user/${user?._id}`);
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
        console.log(user);
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === images?.length - 1 ? images?.length - 1 : prev + 1));
    };

    const toggleLike = async () => {
        const likedAfterAction = !liked;
        setLiked(likedAfterAction);
        setLikesCount(likedAfterAction ? likesCount + 1 : likesCount -1);

        try{
            const res = await fetch('/api/post/toggle-likes',{
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    userEmail: email,
                }),
            })

            const data = await res.json();
            setLikesCount(data.likesCount);
        } catch(err) {
            console.error("Failed to toggle likes: ", err)
            setLiked(!likedAfterAction);
            setLikesCount(likedAfterAction ? likesCount - 1 : likesCount + 1);
        }
    }

    const toggleComment = () => {
        setShowComments((prev)=>!prev);
    }

    const toggleBookmark = async () => {
        try{
            const res = await fetch('/api/post/toggle-bookmarks',{
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    imageURLs: post?.imageURLs,
                    userEmail: email,
                }),
            })

            const data = await res.json();
            setBookmarked(data.bookmarked);
        } catch(err) {
            console.error("Failed to toggle bookmarks: ", err)
        }

    }

    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
    
            // 최소 높이 고정 (초기 높이와 동일하게)
            const minHeight = "36px"; // 적당한 높이 (기본 1줄)
            textarea.style.height = minHeight;
    
            // 내용이 많아지면 늘어나게
            textarea.style.height = `${textarea.scrollHeight}px`;

            setComment(textarea.value);
        }
    };

    const deleteInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.value = ""
        }
        setComment("");
    }

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        const textarea = textareaRef.current;
        
        try {
            const res = await fetch('/api/post/comments', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    postId,
                    userEmail: email,
                    userName: name,
                    text: comment,
                })
            })

            const result = await res.json();
            console.log("✅ DB 저장 성공:", result);

            if (result.success) {
                console.log(result);
                if(textarea) textarea.value = "";
            
                setCommentsList(prev => [...prev, result.comment]);
                setShowComments(true);
                router.refresh();
            } else{
                console.log("실패")
            }
            
        } catch(err) {
            console.error("❌ 오류 발생:", err);
            alert("업로드 중 오류가 발생했습니다.");
        } finally {
            router.refresh();
        }
    }

    const handleEditSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        const textarea = textareaRef.current;

        try {
            const res = await fetch(`/api/post/comments/${commentId}`,{
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: comment }),
            });

            const result = await res.json();
            console.log("✅ DB 저장 성공:", result);

            if(res.ok) {
                if(textarea) textarea.value = "";
                const editedCommentWithInfo : Comment = {
                    _id: commentId,
                    postId,
                    userEmail: email,
                    userName: name,
                    text: comment,
                    createdAt: "now",
                };
            
                setCommentsList(prev => prev.map(comment => comment._id === editedCommentWithInfo._id ? editedCommentWithInfo : comment));
                setShowComments(true);
                router.refresh();
            } else{
                console.log("실패")
            }

        } catch(err) {
            console.error('댓글 수정 중 오류 발생:', err);
        } finally {
            setIsEditingComment(false);
            router.refresh();
        }
    }

    const getTimeAgo = (dateStr: string) => {
        if(dateStr === "now") return "방금 전";

        const now = new Date();
        const past = new Date(dateStr);
        const diffMs = now.getTime() - past.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHrs / 24);
    
        if (diffSec < 60) return `${diffSec}초 전`;
        if (diffMin < 60) return `${diffMin}분 전`;
        if (diffHrs < 24) return `${diffHrs}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
    
        const year = past.getFullYear();
        const month = String(past.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = String(past.getDate()).padStart(2, '0');

        return `${year}.${month}.${day}`;
    };

    const toggleCommentMenu = (key : string | undefined) => {  
        if(!key) return;

        setShowCommentMenu((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    }

    const deleteComment = async (commentId : string | undefined) => {
        // console.log("commentId: ", commentId);
        try {
            const res = await fetch(`/api/post/comments/${commentId}`,{
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error('댓글 삭제 실패');
            }

            if (res.ok) {
                setCommentsList((prev) => prev.filter(c => c._id !== commentId));
                console.log('댓글 삭제 성공');
            }
        } catch(err) {
            console.error('댓글 삭제 중 오류 발생:', err);
        } finally {
            router.refresh();
        }
    }

    const clickEdit = (commentId : string | undefined, originalText : string) => {
        toggleCommentMenu(commentId);
        setIsEditingComment(true);

        const textarea = textareaRef.current;
        if(textarea){
            textarea.focus();
            textarea.value = originalText;
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }

    }

    const handleFollow = async () => {
        console.log("handleFollow executed")
        try {
            const res = await fetch('/api/follow', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionUserEmail: email,
                    postAuthorEmail: post?.userEmail,
                })
            })

            const data = await res.json();
            console.log("✅ DB 저장 성공:", data);
            setIsFollowed(data.isFollowing);
        } catch(err) {
            console.error("팔로우 중 오류 발생: ", err)
        }
    }

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
        const fetchUser = async () => { // 게시물 작성자 색출
            try {
                const response = await fetch('/api/post/edit-profile');
                if(response.ok){
                    const userData = await response.json();
                    const foundUser: User = userData.users.find((user: User) => user.email === post?.userEmail);
                    // console.log("foundUser:", foundUser);
                    setUser(foundUser); // post 정보의 이메일과 일치하는 user 색출 후 저장
                } else {
                    console.error('DB 조회 실패');
                }
            } catch(err) {
                console.error('API 호출 오류:', err);
            }
        }

        const fetchBookmark = async () => { // 북마크 여부
            try {
                const response = await fetch(`/api/post/toggle-bookmarks?postId=${postId}&userEmail=${email}`);
                const data = await response.json();
                setBookmarked(data.bookmarked);
            } catch(err) {
                console.error('API 호출 오류:', err);
            }
        }

        if (post) {
            console.log(post);
            fetchUser();
            setImages(post.imageURLs);
            setLikesCount(post.likesCount || 0);
            setLiked(post.likes?.includes(email) ?? false); // ?? 는 좌측 값이 null / undefined 일 때 우측 값을 사용한다는 의미
            setCreatedAt(post.createdAt);
            fetchBookmark();
        }
    }, [post, email, postId])  // post가 변경될 때마다 실행

    useEffect(() => { // 댓글 불러오기
        const fetchComment = async () => {
            try {
                const res = await fetch('/api/post/comments');
                if(res.ok) {
                    const data = await res.json();
                    const foundComments: Comment[] = data.comments.filter((comment: Comment) => comment.postId === postId);
                    // console.log(foundComments);
                    if(foundComments){
                        setCommentsList(foundComments);
                    } else{
                        console.error('DB 조회 실패');
                    }
                }
            } catch(err) {
                console.error('API 호출 오류:', err);
            }
        }

        fetchComment();
    }, [email, postId])

    useEffect(() => { // 팔로우 여부
        if (!email || !post?.userEmail) return;

        const fetchFollow = async () => {
            try {
                const res = await fetch(`/api/follow?sessionUserEmail=${email}&postAuthorEmail=${post?.userEmail}`);
                if(res.ok) {
                    const data = await res.json();
                    setIsFollowed(data.isFollowing);
                }
            } catch(err) {
                console.error('API 호출 오류:', err);
            }
        }
        
        fetchFollow();
    }, [post, email, postId])

    return (
        <div className="flex flex-col w-full relative mb-[60px]">
            <button 
            onClick={() => router.back()}
            className="cursor-pointer mt-[20px] mb-[10px] ml-[20px] w-[30px] h-[30px] flex justify-center items-center">
                <Image src="/icons/BackArrow.png" width={30} height={30} alt="Back Arrow" />
            </button>
            <div className=""> {/* 게시물 div */}
                <div className="w-full h-[60px] flex items-center"> {/* 유저 정보 */}
                    <Image src="/profile-default.png" width={36} height={36} alt="User Profile Image" className="rounded-full m-[10px] cursor-pointer" onClick={moveToUserPage} /> {/* 유저 프로필 사진 */}
                    <div> {/* 유저 아이디, 키, 몸무게 */}
                        <div className="font-bold text-[16px] h-[22px] cursor-pointer" onClick={moveToUserPage}>
                            {user?.name}
                        </div>
                        <div className="text-[13px] h-[20px]">
                            {user?.height}cm · {user?.weight}kg
                        </div>
                    </div>
                    {
                        user?.email === email ?
                        <></>
                        :
                        <button 
                        className={`ml-auto mr-[10px] cursor-pointer ${isFollowed ? "bg-white text-black border-[1px]" : "bg-black text-white"} font-bold text-[13px] px-[10px] py-[7px] rounded-lg`}
                        onClick={handleFollow}
                        > {/* 팔로우 버튼 */}
                            {isFollowed ? "팔로잉" :"팔로우"}
                        </button>
                    }
                </div>
                <div className="relative w-full aspect-[3/4] mx-auto flex items-center justify-center"> {/* 사진 */}
                    {images[currentIndex] ? (
                    <Image
                        src={images[currentIndex]}
                        fill
                        alt={`Preview ${currentIndex}`}
                        className="w-full h-full object-cover"
                    />
                    ) : (
                        <div>이미지가 없습니다</div> // 혹은 로딩 스피너, 플레이스홀더 이미지 등
                    )}
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white opacity-20 hover:opacity-80 text-black font-bold px-1 py-1 rounded-full shadow">
                        ◀
                    </button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white opacity-20 hover:opacity-80 text-black font-bold px-1 py-1 rounded-full shadow">
                        ▶
                    </button>
                </div>
                <div className="w-full h-[50px] flex items-center"> {/* 좋아요, 댓글, 북마크 */}
                    <div className="w-[25px] h-[25px] ml-[20px] cursor-pointer" onClick={toggleLike} >
                        <Image src={`/icons/heart-${liked ? "clicked" : "unclicked"}.png`} width={25} height={25} alt="Heart Icon" />
                    </div>
                    <div className="relative w-[25px] h-[25px] ml-[25px] cursor-pointer" onClick={toggleComment}>
                        <Image src="/icons/comment.png" fill alt="Comment Icon" />
                    </div>
                    <div className="w-[25px] h-[25px] ml-[25px]  cursor-pointer" onClick={toggleBookmark}>
                        <Image src={`/icons/bookmark-${bookmarked ? "clicked" : "unclicked"}.png`} width={25} height={25} alt="Bookmark Icon" />
                    </div>
                </div>
                <div className="ml-[20px] font-bold text-[15px]">
                    {likesCount} likes
                </div>
                <div className="ml-[20px] mb-[40px]"> {/* 설명 */}
                    <div className="font-bold inline-block mr-[10px]">{user?.name}</div>
                    <div className="inline">{post?.description}</div>
                    <div className="text-gray-400">{createdAt && getTimeAgo(createdAt)}</div>
                </div>
            </div>



            {/* 댓글 */}
            <div className="fixed inset-0 z-50 flex justify-center items-end pointer-events-none">
                <div
                    className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    showComments ? "opacity-50 pointer-events-auto" : "opacity-0"
                    }`}
                    onClick={() => {
                        toggleComment();
                        toggleCommentMenu(commentId);
                    }}
                />
                {/* 댓글창 */}
                <div
                    className={`relative bg-white rounded-t-xl w-full max-w-[750px] h-[70%] p-[20px] transform transition-transform duration-300 ${
                    showComments ? "translate-y-0" : "translate-y-full"
                    } pointer-events-auto`}
                >
                    <div className="h-[30px] flex items-center font-bold text-[18px] w-[98%] mx-auto mb-4">
                        <span className="mr-1">댓글</span>
                        <span className="text-[16px] align-middle leading-none">({commentsList.length})</span>
                    </div>
                    {/* Comments list */}
                    <div className="flex-1 overflow-y-scroll h-[calc(100%-100px)] space-y-3 mb-4 w-[98%] mx-auto">
                    {
                        commentsList.map((comment, index) => (
                            <div key={index} className="text-sm text-gray-700 w-full mb-[20px]">
                                <div className="flex">
                                    <div className="bg-gray-300 w-[35px] h-[35px] rounded-full mr-[10px]">
                                        {/* user profile picture */}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex">
                                            <span className="font-bold">{comment.userName}</span>
                                            <div className="ml-[10px]" >
                                                {getTimeAgo(comment.createdAt)}
                                            </div>
                                        </div>
                                        <div className="">
                                            {comment.text}
                                        </div>
                                    </div>
                                    <div className="w-[40px] relative">
                                        { comment.userEmail === email &&
                                        <Image
                                        src={"/icons/commentMenu.png"}
                                        width={15} height={15}
                                        alt="Comment Menu Icon"
                                        className={`cursor-pointer hover:opacity-100 ${showCommentMenu[comment._id ?? ""] ? "opacity-100" : "opacity-50"}`} 
                                        onClick={() => {
                                            toggleCommentMenu(comment._id)
                                            setCommentId(comment._id)
                                        }}
                                        />
                                        }
                                        { showCommentMenu[comment._id ?? ""] &&
                                        <div className="absolute right-[10px] z-5 w-[45px] h-[60px] flex flex-col justify-center items-center bg-white border border-gray-300 rounded text-[12px]">
                                            <button 
                                            className="cursor-pointer w-full h-full hover:bg-gray-200 duration-200"
                                            onClick={()=>{clickEdit(comment._id, comment.text)}}
                                            >
                                                수정
                                            </button>
                                            <button
                                            className="cursor-pointer w-full h-full hover:bg-gray-200 duration-200"
                                            onClick={()=>{deleteComment(comment._id)}}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                    </div>

                    {/* New comment input */}
                    <form
                    onSubmit={isEditingComment ? handleEditSubmit : handleSubmit}
                    className="w-[calc(100%-40px)] absolute bottom-[14px]"
                    >
                        <div className="relative w-full">
                            <textarea
                                ref={textareaRef}
                                onInput={handleInput}
                                rows={1}
                                required
                                className="w-full border rounded-md p-2 pr-17 text-sm resize-none h-[36px] min-h-[36px] focus:outline-none"
                                placeholder="댓글을 남겨주세요."
                            />
                            {comment ?
                            (
                            <div>
                                <div className="absolute right-[40px] bottom-[14px] w-[20px] h-[20px] rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                                    <X size={12} className="text-white cursor-pointer" onClick={deleteInput} />
                                </div>

                                <button type="submit" className="absolute right-[10px] bottom-[14px] w-[20px] h-[20px] rounded-full bg-black flex items-center justify-center cursor-pointer">
                                    <ArrowUp size={12} className="text-white" />
                                </button>
                            </div>
                            ) :
                            (
                            <div className="absolute right-[10px] bottom-[14px] w-[20px] h-[20px] rounded-full bg-gray-200 flex items-center justify-center">
                                <ArrowUp size={12} className="text-white" />
                            </div>
                            )
                            }
                            
                        </div>
                    </form>

                </div>
            </div>


        </div>
    );
}

export default PostView;