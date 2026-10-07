"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/app/context/UserContext";

const SignUp = () => {
  const { setUserData, refetchUserData } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", height: "", weight: "", sex: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("height", form.height);
      formData.append("weight", form.weight);
      formData.append("sex", form.sex);

      const res = await fetch("/api/post/edit-profile", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Non-JSON response received:", text);
        alert("서버 응답 형식이 올바르지 않습니다.");
        return;
      }

      if (res.ok) {
        if (data.user) {
          setUserData(data.user);
        } else {
          await refetchUserData();
        }

        router.replace("/mypage");
      } else {
        alert(data.error || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("제출 중 오류 발생:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-20">
      <h4>정보 입력</h4>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        <input name="name" placeholder="이름" value={form.name} onChange={handleChange} required />
        <input name="height" placeholder="키(cm)" value={form.height} onChange={handleChange} required />
        <input name="weight" placeholder="몸무게(kg)" value={form.weight} onChange={handleChange} required />
        <div className="sex">
          <input
            type="radio"
            name="sex"
            value="male"
            checked={form.sex === "male"}
            onChange={handleChange}
          />
          남
          <input
            type="radio"
            name="sex"
            value="female"
            checked={form.sex === "female"}
            onChange={handleChange}
          />
          여
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "제출 중..." : "제출"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
