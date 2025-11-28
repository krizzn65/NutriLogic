import React from "react";
import Shimmer from "../ui/Shimmer";

export default function LaporanKaderSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-56 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Date Range Filter Skeleton */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Shimmer className="h-4 w-24 mb-2" variant="text" />
                            <Shimmer className="h-10 w-full" />
                        </div>
                        <div className="flex-1">
                            <Shimmer className="h-4 w-24 mb-2" variant="text" />
                            <Shimmer className="h-10 w-full" />
                        </div>
                        <Shimmer className="h-10 w-32" />
                    </div>
                </div>

                {/* Summary Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <Shimmer className="h-4 w-32 mb-3" variant="text" />
                            <Shimmer className="h-8 w-20 mb-2" />
                            <Shimmer className="h-3 w-24" variant="text" />
                        </div>
                    ))}
                </div>

                {/* Chart Skeleton */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <Shimmer className="h-6 w-48 mb-4" />
                    <Shimmer className="h-80 w-full" />
                </div>

                {/* Report Table Skeleton */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <Shimmer className="h-6 w-40 mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div className="flex-1">
                                    <Shimmer className="h-4 w-48 mb-2" variant="text" />
                                    <Shimmer className="h-3 w-32" variant="text" />
                                </div>
                                <Shimmer className="h-8 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
