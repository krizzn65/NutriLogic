import React from "react";
import Shimmer from "../ui/Shimmer";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function DashboardOrangTuaSkeleton() {
    const RightSidebarSkeleton = (
        <div className="flex flex-col gap-10">
            {/* User Profile Skeleton */}
            <div className="hidden xl:flex items-center justify-end gap-4">
                <div className="text-right">
                    <Shimmer className="h-4 w-32 mb-1" />
                    <Shimmer className="h-3 w-20 ml-auto" />
                </div>
                <Shimmer className="w-12 h-12 rounded-full" />
            </div>

            {/* Child Card Skeleton */}
            <div className="shrink-0">
                <div className="flex justify-between mb-4">
                    <Shimmer className="h-6 w-24" />
                    <Shimmer className="h-8 w-32 rounded-full" />
                </div>
                <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <Shimmer className="h-6 w-32 mb-2" />
                            <Shimmer className="h-4 w-20" />
                        </div>
                        <Shimmer className="w-16 h-16 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Shimmer className="h-16 rounded-2xl" />
                        <Shimmer className="h-16 rounded-2xl" />
                    </div>
                </div>
            </div>

            {/* Calendar Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                <Shimmer className="h-8 w-40 mb-6 mx-auto" />
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <Shimmer key={i} className="h-8 w-8 rounded-full mx-auto" />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout rightSidebar={RightSidebarSkeleton}>
            {/* Hero Card Skeleton */}
            <div className="w-full h-48 rounded-[24px] bg-gray-100 relative overflow-hidden mb-6">
                <Shimmer className="w-full h-full" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <Shimmer className="w-12 h-12 rounded-full" />
                        <div>
                            <Shimmer className="h-4 w-24 mb-2" />
                            <Shimmer className="h-6 w-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Child & Calendar Skeleton (xl:hidden) */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 xl:hidden mb-6">
                <div className="h-full bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <Shimmer className="h-5 w-24" />
                        <Shimmer className="w-10 h-10 rounded-full" />
                    </div>
                    <Shimmer className="h-4 w-full mb-2" />
                    <Shimmer className="h-4 w-2/3" />
                </div>
                <div className="h-full bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                    <Shimmer className="h-6 w-full mb-4" />
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 28 }).map((_, i) => (
                            <Shimmer key={i} className="h-6 w-6 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Growth Chart Skeleton */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 h-[400px]">
                <div className="flex justify-between mb-6">
                    <Shimmer className="h-8 w-48" />
                    <Shimmer className="h-8 w-32 rounded-lg" />
                </div>
                <Shimmer className="w-full h-[300px]" />
            </div>
        </DashboardLayout>
    );
}
