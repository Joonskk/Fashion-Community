import Link from "next/link";
import Image from "next/image";

const StyleCard = ({postImageURL, postID} : {postImageURL: string, postID : string}) => {
    return (
        <div className="relative h-[300px] max-w-sm border border-gray-200">
            <Link href={`/post/${postID}`} className=" block relative w-full h-full">
                <Image src={postImageURL} 
                    fill 
                    sizes="(max-width: 640px) 100vw, 384px" 
                    alt="First Image of the Post" 
                    priority
                    className="object-cover" 
                />
            </Link>
        </div>

    )
}

export default StyleCard;