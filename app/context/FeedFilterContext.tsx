"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type FilterState = {
  sex: "all" | "male" | "female";
  hashtags: string[];
  colors: string[];
};

type FeedFilterContextType = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
};

const FeedFilterContext = createContext<FeedFilterContextType | null>(null);

type FeedFilterProviderProps = {
  children: ReactNode;
};

export const FeedFilterProvider = ({ children }: FeedFilterProviderProps) => {
  const [filters, setFilters] = useState<FilterState>({
    sex: "all",
    hashtags: [],
    colors: [],
  });

  return (
    <FeedFilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FeedFilterContext.Provider>
  );
};

export const useFeedFilter = () => {
  const context = useContext(FeedFilterContext);
  if (!context) {
    throw new Error("useFeedFilter must be used within FeedFilterProvider");
  }
  return context;
};