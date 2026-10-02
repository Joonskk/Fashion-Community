"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ALLOWED_STYLES,
  ALLOWED_ITEMS,
  ALLOWED_SEASONS,
  ALLOWED_GENDERS,
  ALLOWED_COLORS,
} from "@/lib/constants";

interface Post {
  _id: string;
  userEmail: string;
  authorName?: string;
  description: string;
  images: Array<{ url: string } | string>;
  styles: string[];
  items: string[];
  season: string;
  gender: string;
  colors: string[];
  likesCount?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch search results from API
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (query) params.set("q", query);
      if (selectedStyles.length > 0) params.set("styles", selectedStyles.join(","));
      if (selectedItems.length > 0) params.set("items", selectedItems.join(","));
      if (selectedColors.length > 0) params.set("colors", selectedColors.join(","));
      if (selectedSeason) params.set("season", selectedSeason);
      if (selectedGender) params.set("gender", selectedGender);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/post/search?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedStyles, selectedItems, selectedColors, selectedSeason, selectedGender, page]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const handleFilterChange = (setter: Function, value: any) => {
    setPage(1);
    setter(value);
  };

  const toggleArrayFilter = (
    currentList: string[],
    setter: (val: string[]) => void,
    val: string
  ) => {
    setPage(1);
    if (currentList.includes(val)) {
      setter(currentList.filter((item) => item !== val));
    } else {
      setter([...currentList, val]);
    }
  };

  const clearAllFilters = () => {
    setQuery("");
    setSelectedStyles([]);
    setSelectedItems([]);
    setSelectedColors([]);
    setSelectedSeason("");
    setSelectedGender("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-25">
      {/* 1. Universal Search Input */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Discover Outfits</h1>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleFilterChange(setQuery, e.target.value)}
            placeholder="Search by author, item (e.g. jacket), color (e.g. black), or description..."
            className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
          />
          <svg
            className="w-5 h-5 absolute left-4 top-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* 2. Multi-Filter Controls Toolbar */}
      <div className="space-y-4 mb-8 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Filters
          </span>
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:underline font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Dropdowns for Season & Gender */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={selectedSeason}
            onChange={(e) => handleFilterChange(setSelectedSeason, e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <option value="">All Seasons</option>
            {ALLOWED_SEASONS.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={selectedGender}
            onChange={(e) => handleFilterChange(setSelectedGender, e.target.value)}
            className="p-2.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <option value="">All Fits</option>
            {ALLOWED_GENDERS.map((g) => (
              <option key={g} value={g}>
                {g.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Style Tag Chips */}
          <div className="col-span-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-gray-400 whitespace-nowrap">Styles:</span>
            {ALLOWED_STYLES.slice(0, 8).map((style) => (
              <button
                key={style}
                onClick={() =>
                  toggleArrayFilter(selectedStyles, setSelectedStyles, style)
                }
                className={`px-3 py-1 rounded-full text-xs font-medium border transition whitespace-nowrap ${
                  selectedStyles.includes(style)
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-gray-400"
                }`}
              >
                #{style}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Item Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200 dark:border-zinc-800">
          <span className="text-xs text-gray-400 mr-1">Items:</span>
          {ALLOWED_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() =>
                toggleArrayFilter(selectedItems, setSelectedItems, item)
              }
              className={`px-2.5 py-0.5 rounded-md text-xs transition capitalize ${
                selectedItems.includes(item)
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black font-semibold"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Quick Color Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200 dark:border-zinc-800">
          <span className="text-xs text-gray-400 mr-1">Colors:</span>
          {ALLOWED_COLORS.map((color) => (
            <button
              key={color}
              onClick={() =>
                toggleArrayFilter(selectedColors, setSelectedColors, color)
              }
              className={`px-2.5 py-0.5 rounded-md text-xs transition capitalize ${
                selectedColors.includes(color)
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Results Counter */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-black dark:text-white">{totalCount}</span> outfits
        </p>
      </div>

      {/* 4. Outfit Card Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/40 rounded-2xl">
          <p className="text-gray-500 text-lg">No outfits match your search criteria.</p>
          <button
            onClick={clearAllFilters}
            className="mt-4 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => {
            const imageUrl =
              typeof post.images[0] === "string"
                ? post.images[0]
                : post.images[0]?.url;

            return (
              <Link
                key={post._id}
                href={`/post/${post._id}`}
                className="group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-900 aspect-[3/4] border border-gray-200 dark:border-zinc-800"
              >
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={post.description || "Outfit post"}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200 p-3 flex flex-col justify-end text-white">
                  <p className="text-xs font-semibold mb-0.5">
                    {post.authorName || "Anonymous"}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {post.season && (
                      <span className="text-[10px] bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded uppercase">
                        {post.season}
                      </span>
                    )}
                    {post.styles?.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded"
                      >
                        #{s}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs line-clamp-1 opacity-90">
                    {post.description || "View Outfit"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 5. Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
