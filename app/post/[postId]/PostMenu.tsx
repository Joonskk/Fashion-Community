import { useParams, useRouter } from "next/navigation";

type PostMenuProps = {
    showPostMenu: boolean,
    setShowPostMenu: React.Dispatch<React.SetStateAction<boolean>>;
    copyURL: () => void;
}

const PostMenu = ({showPostMenu, setShowPostMenu, copyURL} : PostMenuProps) => {

    const router = useRouter();

    const params = useParams();
    const postId = params?.postId as string;

    const togglePostMenu = () => {
        setShowPostMenu((prev)=>!prev);
    }

    const deletePost = async () => {
        try {
            const res = await fetch(`/api/post/delete-post/${postId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error('게시물 삭제 실패');
            }

            if (res.ok){
                console.log('게시물 삭제 성공');
                router.push('/mypage');
            }

        } catch(err) {
            console.error('게시물 삭제 중 오류 발생:', err);
        } finally {
            router.refresh();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-end pointer-events-none">
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                showPostMenu ? "opacity-50 pointer-events-auto" : "opacity-0"
                }`}
                onClick={() => {
                    togglePostMenu();
                }}
            />
            {/* 메뉴창 */}
            <div
                className={`relative bg-white rounded-t-xl w-full max-w-[750px] h-[180px] py-[10px] transform transition-transform duration-300 ${
                showPostMenu ? "translate-y-0" : "translate-y-full"
                } pointer-events-auto`}
            >
                <div 
                    className="w-full h-[80px] flex justify-center items-center hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                    onClick={()=>{togglePostMenu(); copyURL()}}
                >
                    링크 복사
                </div>
                <div 
                    className="w-full h-[80px] flex justify-center items-center hover:bg-gray-100 cursor-pointer text-[18px] text-red-500"
                    onClick={()=>deletePost()}
                >
                    삭제
                </div>
            </div>
        </div>
    )
}

export default PostMenu;