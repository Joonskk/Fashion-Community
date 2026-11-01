"use client";

import { useEffect, useRef, useState } from "react";
import StyleCard from "@/app/components/StyleCard";

export interface FeedCard {
    _id: string;
    imageUrl: string;
}

interface Props {
    initialPosts: FeedCard[];
    initialCursor: string | null;
    query: string; // e.g. "sort=likes&sex=female"
}

export default function InfiniteFeed({ initialPosts, initialCursor, query }: Props) {
    const [posts, setPosts] = useState(initialPosts);
    const [cursor, setCursor] = useState(initialCursor);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false);               // blocks double requests
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !cursor) return;           // no more pages: don't watch

        const observer = new IntersectionObserver(async ([entry]) => {
            if (!entry.isIntersecting || loadingRef.current) return;
            loadingRef.current = true;
            setLoading(true);
            try {
                const res = await fetch(`/api/posts?${query}&cursor=${cursor}`);
                if (!res.ok) return;
                const data = await res.json();
                const next: FeedCard[] = data.posts.map((p: { _id: string; images: { url: string }[] }) => ({
                    _id: p._id,
                    imageUrl: p.images[0]?.url,
                }));
                setPosts((prev) => [...prev, ...next]); // add the new page after the old ones
                setCursor(data.nextCursor);                   // the bookmark for the page after
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        }, { rootMargin: "600px" });                // start loading 600px before the bottom

        observer.observe(sentinel);
        return () => observer.disconnect();         // clean up when cursor changes
    }, [cursor, query]);

    return (
        <div>
            <div className="flex flex-wrap mt-4">
                {posts.map((post, index) => (
                    <div key={post._id} className="w-1/2 md:w-1/3">
                        <StyleCard postImageURL={post.imageUrl} postID={post._id} priority={index === 0} />
                    </div>
                ))}
            </div>
            {cursor && <div ref={sentinelRef} className="h-10" />}
            {loading && <p className="text-center text-gray-400 py-4">Loading…</p>}
        </div>
    );
}