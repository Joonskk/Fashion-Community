"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { UserContext } from "@/app/context/UserContext";

export const SessionProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SessionProvider>
      <UserContextProvider>{children}</UserContextProvider>
    </SessionProvider>
  );
};

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <UserContext.Provider
      value={status == "authenticated"
        ? {
        email: session.user?.email || "",
        name: session.user?.name || "",
        session: true,
      }
        : {
        email: "",
        name: "",
        session: false,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
