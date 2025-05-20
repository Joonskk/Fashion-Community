"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Edit = () => {

  const router = useRouter();

  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

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
      <h4>프로필 편집</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
        />
        <input
          name="height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="키(cm)"
        />
        <input
          name="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="몸무게(kg)"
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

export default Edit;
