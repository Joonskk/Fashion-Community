"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Filter = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Read current 'sex' filter from URL query string
  const currentSex = searchParams.get("sex") || "all";

  const toggleSex = (sex: "male" | "female") => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Toggle: if clicking the active sex filter, reset to 'all'
    const newSex = currentSex === sex ? "all" : sex;

    if (newSex !== "all") {
      params.set("sex", newSex);
    } else {
      params.delete("sex");
    }

    // Triggers a fast Server Component re-render with updated query params
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="px-5 pt-4 flex">
      <div className="flex">
        <button
          onClick={() => toggleSex("male")}
          className={`w-[40px] h-[40px] mx-1 rounded-md border font-bold cursor-pointer
            ${currentSex === "male" ? "bg-black text-white" : "border-gray-200"}
          `}
        >
          남
        </button>

        <button
          onClick={() => toggleSex("female")}
          className={`w-[40px] h-[40px] mx-1 rounded-md border font-bold cursor-pointer
            ${currentSex === "female" ? "bg-black text-white" : "border-gray-200"}
          `}
        >
          여
        </button>
      </div>
    </div>
  );
};

export default Filter;
