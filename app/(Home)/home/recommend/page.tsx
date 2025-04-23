import Filter from "@/app/components/Filter";
import StyleCard from "@/app/components/StyleCard";

const Recommend = () => {
    const Styles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return (
        <div className="mt-[88px] mb-[100px]">
        <Filter />
        <div className="flex flex-wrap mt-4">
            {Styles.map((_, index) => (
            <div key={index} className="w-1/2 md:w-1/3">
                <StyleCard num={index} />
            </div>
            ))}
        </div>
        </div>
    );
};

export default Recommend;
