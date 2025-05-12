import Link from "next/link";

const StyleCard = ({postImageURL} : {postImageURL: string}) => {
    return (
        <div className="h-[300px] max-w-sm border border-gray-200">
            <Link href="" className="w-full h-full">
                <img src={postImageURL} className="w-full h-full object-cover" />
            </Link>
        </div>

    )
}

export default StyleCard;