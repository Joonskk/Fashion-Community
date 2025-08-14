// app/settings/layout.tsx
"use client"

import { ReactNode } from "react";
import SettingsNav from "./SettingsNav";

type SettingsLayoutProps = {
  children: ReactNode;
};

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <div className="w-full min-h-screen">
        <div className="flex pt-[20px]">
            {/* 왼쪽 네비게이션 */}
            <div className="border-r border-gray-200 w-[200px] h-screen">
                <SettingsNav />
            </div>

            {/* 오른쪽 페이지 내용 */}
            <div className="flex-1 p-6">
                {children}
            </div>
        </div>
    </div>
  );
};

export default SettingsLayout;
