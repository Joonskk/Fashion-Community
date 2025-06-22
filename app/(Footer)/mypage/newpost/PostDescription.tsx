import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext'
import Link from 'next/link';

const PostDescription = ({ images } : {images : File[]}) => {
    
    const router = useRouter();
    const { email } = useUser();
    
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [isPosting, setIsPosting] = useState<boolean>(false);

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        setIsPosting(true);

        try {
            const imageURLs: string[] = [];
            const formData = new FormData();
            for (const file of images){
                formData.append("file", file);
                formData.append("upload_preset", "wearly_images");
                const res = await fetch("https://api.cloudinary.com/v1_1/wearly/image/upload", {
                    method: "POST",
                    body: formData,
                })
                console.log("Uploaded to Cloudinary: ", res);

                const data = await res.json();
                imageURLs.push(data.secure_url);
            }
            
            const response = await fetch('/api/post/create-post',{
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    imageURLs,
                    description,
                    likes: [],
                    likesCount: 0,
                }),
            })

            const result = await response.json();
            console.log("✅ DB 저장 성공:", result);

            if (result.success) {
                router.push('/mypage');
            }

        } catch(err) {
            console.error("❌ 오류 발생:", err);
            alert("업로드 중 오류가 발생했습니다.");
        }
    }

    return (
        <div className="flex flex-col w-full relative">
            <div>
                <button 
                onClick={() => router.push("/mypage")}
                className="cursor-pointer mt-[20px] mb-[10px] ml-[20px] w-[30px] h-[30px] flex justify-center items-center">
                    <img src="/icons/BackArrow.png" className="w-[30px] h-[30px]" />
                </button>
            </div>
            <div className="relative w-[300px] h-[400px] mx-auto flex items-center justify-center mt-[20px]">
                <img
                    src={URL.createObjectURL(images[currentIndex])}
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
            <div className="my-[20px] w-full">
                <textarea 
                placeholder="Add Description..."
                className="w-full h-[150px] p-[15px] resize-none"
                onChange={(e)=>setDescription(e.target.value)}
                />
            </div>
            <form onSubmit={handleSubmit} className="flex justify-center mx-auto" >
                <div className="flex text-center w-[70px] h-[30px] mr-[10px]">
                {isPosting ? (
                <div className="w-full h-full flex justify-center items-center border rounded-sm bg-gray-200 text-gray-400 cursor-not-allowed">
                    Cancel
                </div>
                ) : (
                <Link
                    href="/mypage"
                    className="cursor-pointer w-full h-full flex justify-center items-center border rounded-sm hover:bg-gray-100"
                >
                    Cancel
                </Link>
                )}
                </div>
                <button
                type="submit"
                disabled={isPosting}
                className={`w-[70px] h-[30px] border rounded-md flex items-center justify-center
                    ${isPosting ? 'bg-gray-200 text-white cursor-not-allowed' : 'bg-black text-white hover:bg-opacity-80 cursor-pointer'}
                `}
                >
                    {isPosting ? 'Posting...' : 'Post'}
                </button>
            </form>
        </div>
    )
}

export default PostDescription;