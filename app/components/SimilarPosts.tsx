// components/SimilarPosts.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Post {
  _id: string;
  authorName?: string;
  description: string;
  images: Array<{ url: string } | string>;
  season?: string;
  styles?: string[];
}

export default function SimilarPosts({ currentPostId }: { currentPostId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const res = await fetch(`/api/post/${currentPostId}/similar`);
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error("Failed to load similar posts:", err);
      } finally {
        setLoading(false);
      }
    }

    if (currentPostId) {
      fetchSimilar();
    }
  }, [currentPostId]);

  if (loading) {
    return (
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-4">You Might Also Like</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-zinc-800 pt-8">
      <h3 className="text-xl font-bold mb-4">You Might Also Like</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  alt={post.description || "Similar outfit"}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200 p-2.5 flex flex-col justify-end text-white">
                <p className="text-[11px] font-semibold">{post.authorName || "Anonymous"}</p>
                <p className="text-[10px] opacity-80 line-clamp-1">{post.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
