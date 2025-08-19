"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";

const EditPage = () => {

  const router = useRouter();
  const { userData, session, refetchUserData } = useUser();

  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  }

  useEffect(() => {    
    if(!session || !userData) return;
    setName(userData.name);
    setHeight(userData.height);
    setWeight(userData.weight);
    setPreview(userData.profileImage.url)
    console.log(userData.profileImage.url)
  }, [session, userData]);  

  useEffect(() => {
    if (!userData) return;
  
    const hasChanged =
      name !== userData.name ||
      height !== userData.height ||
      weight !== userData.weight ||
      (file !== null);
  
    setIsChanged(hasChanged);
  }, [name, height, weight, file, userData]);

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "wearly_images");
    formData.append("folder", "wearly_profiles");

    const res = await fetch("https://api.cloudinary.com/v1_1/wearly/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return {public_id: data.public_id, url: data.secure_url};
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let profileImage = null;
    if (file){
      profileImage = await uploadImageToCloudinary(file);
    }
    
    const updatedProfile = { name, height, weight, profileImage: profileImage };

    const response = await fetch('/api/post/edit-profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProfile),
    });

    console.log(response);

    if (response.ok) {
      await refetchUserData();
      router.push('/mypage');
    } else {
      alert('업데이트 실패!');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h4 className="font-bold text-[20px] mb-[10px]">프로필 편집</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="w-full flex justify-center">
          <Image src={preview || "/profile-default.png"} 
            width={150} 
            height={150}
            alt="User Profile Image" 
            unoptimized
            className="rounded-full cursor-pointer w-[150px] h-[150px] object-cover transition duration-300 hover:brightness-70" 
            onClick={handleImageClick}
          />
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          className="border-l-[2px] border-gray-300 pl-[10px] mb-[5px] focus:outline-none"
        />
        <input
          name="height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="키(cm)"
          className="border-l-[2px] border-gray-300 pl-[10px] mb-[5px] focus:outline-none"
        />
        <input
          name="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="몸무게(kg)"
          className="border-l-[2px] border-gray-300 pl-[10px] mb-[5px] focus:outline-none"
        />
        <div className="w-full flex justify-center">
          <button 
            type="submit"
            disabled={!isChanged || isSubmitting}
            className={`cursor-pointer w-[150px] h-[40px] text-white font-bold border rounded-sm
            ${isChanged ? "bg-black" : "bg-gray-300"}
            ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black"}`}
          >
            {isSubmitting ? "제출중..." : "제출"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPage;
