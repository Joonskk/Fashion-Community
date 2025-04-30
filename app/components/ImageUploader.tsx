'use client'

import { CldUploadWidget } from 'next-cloudinary';

const ImageUploader = ({ onUpload }: { onUpload: (url: string) => void }) => {
  return (
    <CldUploadWidget
        uploadPreset="wearly_images"
        onSuccess={(result: any) => {
            const imageUrl = result?.info?.secure_url; // result.info.secure_url = 업로드된 이미지의 url
            if (imageUrl) onUpload(imageUrl);
        }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open?.()}
          className="bg-black text-white px-4 py-2 rounded cursor-pointer"
        >
          Upload Image
        </button>
      )}
    </CldUploadWidget>
  );
}

export default ImageUploader;