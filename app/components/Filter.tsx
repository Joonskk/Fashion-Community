"use client";

import { useFeedFilter } from "@/app/context/FeedFilterContext";

const Filter = () => {
  const { filters, setFilters } = useFeedFilter();

  const toggleSex = (sex: "male" | "female") => {
    setFilters((prev) => ({
      ...prev,
      sex: prev.sex === sex ? "all" : sex,
    }));
  };

  return (
    <div className="px-5 pt-4 flex">
      <div className="flex">
        <button
          onClick={() => toggleSex("male")}
          className={`w-[40px] h-[40px] mx-1 rounded-md border font-bold cursor-pointer
            ${filters.sex === "male" ? "bg-black text-white" : "border-gray-200"}
          `}
        >
          남
        </button>

        <button
          onClick={() => toggleSex("female")}
          className={`w-[40px] h-[40px] mx-1 rounded-md border font-bold cursor-pointer
            ${filters.sex === "female" ? "bg-black text-white" : "border-gray-200"}
          `}
        >
          여
        </button>
      </div>
    </div>
  );
};

export default Filter;