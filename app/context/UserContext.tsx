"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

export type UserData = {
  _id: string;
  name: string;
  email: string;
  height: string;
  weight: string;
  profileImage: { url: string; public_id: string };
  followersCount: number;
  followingCount: number;
};

type UserContextType = {
  session: boolean;
  email: string;
  userData: UserData | null;
};

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/post/edit-profile");
        if (response.ok) {
          const data = await response.json();
          const foundUser: UserData | undefined = data.users.find(
            (user: UserData) => user.email === session.user?.email
          );
          if (foundUser) setUserData(foundUser);
        } else {
          console.error("DB 조회 실패");
        }
      } catch (error) {
        console.error("API 호출 오류:", error);
      }
    };

    fetchUserData();
  }, [session?.user?.email]);

  return (
    <UserContext.Provider
      value={{
        session: status === "authenticated",
        email: session?.user?.email || "",
        userData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
