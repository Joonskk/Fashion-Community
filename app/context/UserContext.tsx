"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

export type UserData = {
  _id: string;
  name: string;
  height: string;
  weight: string;
  email: string;
  sex: string;
  profileImage: { url: string; public_id: string };
  followersCount: number;
  followingCount: number;
};

type UserContextType = {
  session: boolean;
  email: string;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  userDataLoaded: boolean;
  refetchUserData: () => Promise<void>;
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
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const fetchUserData = async () => {
    if (!session?.user?.email) {
      setUserDataLoaded(true);
      return;
    }

    try {
      // Call the new targeted endpoint
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        // Extract the specific user object directly from response
        if (data.user) {
          setUserData(data.user);
          console.log("foundUser: ", data.user);
        }
      } else if (response.status === 404) {
        // Unregistered user - expected behavior for new signups
        setUserData(null);
      }  else {
        console.error("DB 조회 실패");
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
    } finally {
      setUserDataLoaded(true);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setUserData(null);
      setUserDataLoaded(true);
    }
  }, [session?.user?.email, status]);

  return (
    <UserContext.Provider
      value={{
        session: status === "authenticated",
        email: session?.user?.email || "",
        userData,
        setUserData,
        userDataLoaded,
        refetchUserData: fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
