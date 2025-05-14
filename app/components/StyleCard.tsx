import Link from "next/link";

const StyleCard = ({postImageURL, postID} : {postImageURL: string, postID : string}) => {
    return (
        <div className="h-[300px] max-w-sm border border-gray-200">
            <Link href={`/post/${postID}`} className="w-full h-full">
                <img src={postImageURL} className="w-full h-full object-cover" />
            </Link>
        </div>

    )
}

export default StyleCard;