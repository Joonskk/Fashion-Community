// app/providers/SessionProviderWrapper.tsx
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { UserContextProvider } from "@/app/context/UserContext";

export const SessionProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <UserContextProvider>{children}</UserContextProvider>
    </SessionProvider>
  );
};
