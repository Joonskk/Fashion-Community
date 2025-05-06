'use client'

import ImageSelect from '@/app/(Footer)/mypage/newpost/ImageSelect';
import PostDescription from '@/app/(Footer)/mypage/newpost/PostDescription';
import { useState, useEffect } from 'react';

const  NewPost = () => {

    const [images, setImages] = useState<File[]>([]);

    const addImages = (files: FileList) => {
        setImages(Array.from(files));
    }

    useEffect(()=>{
        console.log("Images: ", images);
    }, [images]);
    
    return (
        <div className="flex justify-center items-center">
            {images.length === 0 ? (
                <ImageSelect onSelect={addImages} />
            ) : (
                <PostDescription images={images} />
            )}
        </div>

    );
}

export default NewPost;