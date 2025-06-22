import Link from "next/link";
import Image from "next/image";

const StyleCard = ({postImageURL, postID} : {postImageURL: string, postID : string}) => {
    return (
        <div className="relative h-[300px] max-w-sm border border-gray-200">
            <Link href={`/post/${postID}`} className="w-full h-full block">
                <Image src={postImageURL} fill alt="First Image of the Post" className="object-cover" />
            </Link>
        </div>

    )
}

export default StyleCard;