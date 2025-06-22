"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const EditPage = () => {

  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    const nameParam = searchParams.get('name');
    const heightParam = searchParams.get('height');
    const weightParam = searchParams.get('weight');
  
    if (nameParam !== null) setName(nameParam);
    if (heightParam !== null) setHeight(heightParam);
    if (weightParam !== null) setWeight(weightParam);
  }, [searchParams]);  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProfile = { name, height, weight };
    console.log("updatedProfile: ", updatedProfile);

    const response = await fetch('/api/post/edit-profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProfile),
    });

    console.log(response);

    if (response.ok) {
      router.push('/mypage');
    } else {
      alert('업데이트 실패!');
    }
  };

  return (
    <div className="p-20">
      <h4 className="mb-[10px]">프로필 편집</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
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
          <div className="flex text-center w-[70px] h-[30px] mr-[10px]">
            <Link href="/mypage" className="cursor-pointer w-full h-full flex justify-center items-center border rounded-sm">Cancel</Link>
          </div>
          <button type="submit" className="cursor-pointer w-[50px] h-[30px] bg-black text-white border rounded-sm">Edit</button>
        </div>
      </form>
    </div>
  );
};

export default EditPage;
