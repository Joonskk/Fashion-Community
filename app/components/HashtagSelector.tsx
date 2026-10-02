"use client";

import { useState, useEffect } from "react";
import { ALLOWED_STYLES, MAX_HASHTAGS_PER_POST } from "@/lib/constants";

interface HashtagSelectorProps {
    imageUrl: string | null;
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}

export default function HashtagSelector({imageUrl, selectedTags, onChange}: HashtagSelectorProps) {
    const [aiTags, setAiTags] = useState<string[]>([]);
    const [loadingAi, setLoadingAi] = useState(false);

    // Fetch AI tags whenever a new image is uploaded
    useEffect(() => {
    if (!imageUrl) {
        setAiTags([]);
        return;
    }

    async function fetchAiTags() {
        setLoadingAi(true);
        try {
            const res = await fetch("/api/ai/generate-tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
            });
            const data = await res.json();
            
            // Ensure AI tags are normalized and capped at 3
            if (data.tags) {
                setAiTags(data.tags.slice(0, 3));
            }
        } catch (err) {
            console.error("Failed to fetch AI tags:", err);
        } finally {
            setLoadingAi(false);
        }
    }

    fetchAiTags();
}, [imageUrl]);

const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
        onChange(selectedTags.filter((t) => t !== tag));
    } else {
        if (selectedTags.length < MAX_HASHTAGS_PER_POST) {
            onChange([...selectedTags, tag]);
        }
    }
};

return (
    <div className="space-y-4 my-4">
        {/* 1. Main 20 Allowed Hashtag Grid */}
        <div>
            <div className="flex justify-between items-center mb-2 pl-3 pr-3">
                <label className="text-xs font-semibold text-gray-700">
                    Select Styles (Max {MAX_HASHTAGS_PER_POST})
                </label>
                <span className="text-xs text-gray-400">
                    {selectedTags.length} / {MAX_HASHTAGS_PER_POST} selected
                </span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-40 overflow-y-auto">
            {ALLOWED_STYLES.map((style) => {
                const isSelected = selectedTags.includes(style);
                return (
                <button
                    key={style}
                    type="button"
                    onClick={() => toggleTag(style)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                >
                    #{style}
                </button>
                );
            })}
            </div>
        </div>

        {/* 2. AI Recommended Hashtags Section */}
        <div className="p-3 bg-sparkle-50 border border-purple-100 rounded-xl bg-purple-50/50">
            <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                ✨ AI Recommended Styles
            </span>
            {loadingAi && (
                <span className="text-xs text-purple-600 animate-pulse">
                    Analyzing outfit image...
                </span>
            )}
            </div>

            {aiTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
                {aiTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                    <button
                    key={`ai-${tag}`}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                        ? "bg-purple-700 text-white border-purple-700 shadow-sm"
                        : "bg-white text-purple-700 border-purple-200 hover:border-purple-400"
                    }`}
                    >
                    +#{tag}
                    </button>
                );
                })}
            </div>
            ) : (
            !loadingAi && (
                <p className="text-xs text-gray-400">
                Upload an image above to get instant AI style tags.
                </p>
            )
            )}
        </div>
    </div>
  );
}
