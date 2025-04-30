'use client'

import ImageUploader from '@/app/components/ImageUploader';
import { useState, useEffect } from 'react';

const  NewPost = () => {
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (url: string) => {
    setImages((prev) => [...prev, url]);
  };

  useEffect(() => {
    console.log("Updated images:", images);
  }, [images]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mt-[70px] mb-[30px]">New Post</h1>
      <ImageUploader onUpload={handleImageUpload} />
      <div className="mt-[40px] flex flex-wrap justify-center items-center">
        {images.map((url, idx) => (
          <img key={idx} src={url} alt={`Uploaded ${idx}`} className="w-[80px] h-[120px] object-cover rounded-md mx-[5px] mb-2" />
        ))}
      </div>
      <div className="mt-[70px]">
        <textarea placeholder="Description" className="w-[400px] h-[100px] border border-gray-300 rounded-md p-[5px] resize-none"/>
      </div>
      <div>
        <button className="mt-[40px] bg-black text-white px-4 py-2 rounded cursor-pointer">
            Post
        </button>
      </div>
    </div>
  );
}

export default NewPost;