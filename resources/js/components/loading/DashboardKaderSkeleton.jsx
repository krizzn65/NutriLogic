import React from "react";
import Shimmer from "../ui/Shimmer";

export default function DashboardKaderSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto font-montserrat">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
                {/* Header Skeleton */}
                <div className="mb-6">
                    <Shimmer className="h-9 w-64 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <Shimmer className="w-12 h-12 mb-4" />
                            <Shimmer className="h-4 w-24 mb-2" variant="text" />
                            <Shimmer className="h-8 w-16 mb-2" />
                            <Shimmer className="h-4 w-32" variant="text" />
                        </div>
                    ))}
                </div>

                {/* Charts Section Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <Shimmer className="h-7 w-48 mb-4" />
                        <Shimmer className="h-64 w-full" />
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <Shimmer className="h-7 w-40 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Shimmer className="w-10 h-10" variant="circle" />
                                    <div className="flex-1">
                                        <Shimmer className="h-5 w-32 mb-1" />
                                        <Shimmer className="h-4 w-40" variant="text" />
                                    </div>
                                    <Shimmer className="h-3 w-16" variant="text" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
