import Link from "next/link";
import Image from "next/image";

interface StyleCardProps {
    postImageURL: string;
    postID: string;
    priority?: boolean;
}

export default function StyleCard({postImageURL, postID, priority = false} : StyleCardProps) {
    return (
        <div className="relative h-[300px] max-w-sm border border-gray-200">
            <Link href={`/post/${postID}`} className=" block relative w-full h-full">
                <Image 
                    src={postImageURL} 
                    fill 
                    sizes="(max-width: 640px) 100vw, 384px" 
                    alt="First Image of the Post" 
                    priority={priority}
                    loading={priority ? "eager" : "lazy"}
                    className="object-cover" 
                />
            </Link>
        </div>

    )
}