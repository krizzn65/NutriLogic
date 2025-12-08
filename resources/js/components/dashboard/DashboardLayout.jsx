import React from 'react';

export default function DashboardLayout({ children, rightSidebar }) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-3 md:p-6">
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-4 md:gap-6">
                    {children}
                </div>
                {rightSidebar && (
                    <div className="hidden xl:block w-[350px] shrink-0">
                        {rightSidebar}
                    </div>
                )}
            </div>
        </div>
    );
}
