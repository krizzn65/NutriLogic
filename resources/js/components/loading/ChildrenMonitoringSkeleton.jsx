import React from "react";
import Shimmer from "../ui/Shimmer";

export default function ChildrenMonitoringSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-72 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Filter Bar Skeleton */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Shimmer className="h-10 w-full" />
                        <Shimmer className="h-10 w-full" />
                        <Shimmer className="h-10 w-full" />
                        <Shimmer className="h-10 w-full" />
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200 p-4">
                        <div className="grid grid-cols-6 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Shimmer key={i} className="h-4 w-full" variant="text" />
                            ))}
                        </div>
                    </div>
                    {/* Table Rows */}
                    <div className="divide-y divide-gray-200">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="p-4">
                                <div className="grid grid-cols-6 gap-4 items-center">
                                    <Shimmer className="h-4 w-full" variant="text" />
                                    <Shimmer className="h-4 w-full" variant="text" />
                                    <Shimmer className="h-4 w-full" variant="text" />
                                    <Shimmer className="h-4 w-full" variant="text" />
                                    <Shimmer className="h-6 w-20" />
                                    <Shimmer className="h-8 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
