import React from "react";
import Shimmer from "../ui/Shimmer";

export default function DashboardAdminSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-80 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <Shimmer className="h-4 w-24 mb-3" variant="text" />
                            <Shimmer className="h-8 w-16 mb-2" />
                            <Shimmer className="h-3 w-20" variant="text" />
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <Shimmer className="h-6 w-48 mb-4" />
                        <Shimmer className="h-64 w-full" />
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <Shimmer className="h-6 w-48 mb-4" />
                        <Shimmer className="h-64 w-full" />
                    </div>
                </div>

                {/* Recent Activity Skeleton */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <Shimmer className="h-6 w-40 mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Shimmer className="h-10 w-10 rounded-full" />
                                <div className="flex-1">
                                    <Shimmer className="h-4 w-3/4 mb-2" variant="text" />
                                    <Shimmer className="h-3 w-1/2" variant="text" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
