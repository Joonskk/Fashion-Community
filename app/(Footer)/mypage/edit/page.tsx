"use client"

import { useState } from "react";

const Edit = () => {

  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProfile = { name, height, weight };

    const response = await fetch('/api/post/edit-profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProfile),
    });

    console.log(response);

    if (response.ok) {
      window.location.href = '/mypage';
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
        <button type="submit" className="cursor-pointer">Edit</button>
      </form>
    </div>
  );
};

export default Edit;
