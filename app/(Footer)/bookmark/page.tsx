'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StyleCard from '@/app/components/StyleCard';
import Filter from '@/app/components/Filter';
import BookmarkNavbar from '@/app/components/BookmarkNavbar';
import { useUser } from '@/app/context/UserContext';

type Post = {
  _id: string;
  postId: string;
  imageURLs: string[];
  userEmail: string;
};

const Bookmark = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { email } = useUser();

  // URL 쿼리에서 tab 값 읽기, 없으면 "bookmark" 기본값
  const tabParam = searchParams.get('tab') as 'bookmark' | 'likes' | null;
  const [tab, setTab] = useState<'bookmark' | 'likes'>(tabParam ?? 'bookmark');
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Post[]>([]);

  // tab 상태 변경 시 URL 업데이트
  const onTabChange = (newTab: 'bookmark' | 'likes') => {
    setTab(newTab);
    router.replace(`/bookmark?tab=${newTab}`, { scroll: false });
  };

  useEffect(() => {
    if (!email) return;

    const fetchBookmarks = async () => {
      try {
        const response = await fetch('/api/posts/bookmarks');
        if (response.ok) {
          const data = await response.json();
          const bookmarkedPosts: Post[] = data.bookmarkedPosts.filter(
            (post: Post) => post.userEmail === email
          );
          setBookmarks(bookmarkedPosts);
          if (tab === 'bookmark') setPosts(bookmarkedPosts);
        } else {
          console.error('DB 조회 실패');
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
      }
    };

    const fetchLikes = async () => {
      try {
        const response = await fetch('/api/posts/likes', {
          headers: { 'user-email': email },
        });
        if (response.ok) {
          const data = await response.json();
          setLikes(data.likedPosts);
          if (tab === 'likes') setPosts(data.likedPosts);
        } else {
          console.error('DB 조회 실패');
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
      }
    };

    fetchBookmarks();
    fetchLikes();
  }, [email]);

  // URL 쿼리가 바뀌면 탭 상태도 동기화
  useEffect(() => {
    if (tabParam && tabParam !== tab) {
      setTab(tabParam);
      if (tabParam === 'bookmark') setPosts(bookmarks);
      else if (tabParam === 'likes') setPosts(likes);
    }
  }, [tabParam]);

  // 탭 상태가 바뀌면 posts 갱신
  useEffect(() => {
    if (tab === 'bookmark') setPosts(bookmarks);
    else if (tab === 'likes') setPosts(likes);
  }, [tab, bookmarks, likes]);

  return (
    <>
      <BookmarkNavbar tab={tab} setTab={onTabChange} />
      <div className="mt-[88px] mb-[100px]">
        <Filter />
        <div className="flex flex-wrap mt-4">
          {posts.map((post, index) => (
            <div key={index} className="w-1/2 md:w-1/3">
              <StyleCard postImageURL={post.imageURLs[0]} postID={post.postId} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Bookmark;
