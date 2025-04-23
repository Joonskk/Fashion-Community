import Link from "next/link";

const StyleCard = ({num} : {num : number}) => {
    return (
        <div className="h-[300px] max-w-sm border border-gray-200">
            <Link href="" className="w-full h-full">
                <img src={`/styles/style${num + 1}.jpeg`} className="w-full h-full object-cover" />
            </Link>
        </div>

    )
}

export default StyleCard;