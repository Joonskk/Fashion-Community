import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PostDescription = ({ images } : {images : File[]}) => {
    
    const router = useRouter();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [description, setDescription] = useState("");

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();

        try {
            // 1. Cloudinary 업로드
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
            // ERROR !!!!!!!!!!!
            console.log("Working ...")
            const response = await fetch('/api/post/create-post',{
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageURLs,
                    description,
                }),
            })
            console.log("Working 2 ...")
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
                <Link href="/mypage">
                    <img src="/icons/BackArrow.png" className="absolute top-6 left-6 w-[20px] h-[20px]" />
                </Link>
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
                    <Link href="/mypage" className="cursor-pointer w-full h-full flex justify-center items-center border rounded-sm">Cancel</Link>
                </div>
                <button type="submit" className="cursor-pointer bg-black text-white w-[50px] h-[30px] border rounded-md">
                    Post
                </button>
            </form>
        </div>
    )
}

export default PostDescription;