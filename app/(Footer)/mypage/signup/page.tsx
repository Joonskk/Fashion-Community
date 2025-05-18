"use client"

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SignUp = () => {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', height: '', weight: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('height', form.height);
    formData.append('weight', form.weight);

    const res = await fetch('/api/post/edit-profile', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      router.push('/mypage');  // 저장 후 마이페이지로 이동
    } else {
      const data = await res.json();
      alert(data.error || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-20">
      <h4>정보 입력</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <input name="name" placeholder="이름" value={form.name} onChange={handleChange} />
        <input name="height" placeholder="키(cm)" value={form.height} onChange={handleChange} />
        <input name="weight" placeholder="몸무게(kg)" value={form.weight} onChange={handleChange} />
        <button type="submit">제출</button>
      </form>
    </div>
  );
};

export default SignUp;
