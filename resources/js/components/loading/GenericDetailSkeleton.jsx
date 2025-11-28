import React from "react";
import Shimmer from "../ui/Shimmer";

export default function GenericDetailSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header with Back Button Skeleton */}
                <div className="flex items-center gap-4 mb-2">
                    <Shimmer className="h-10 w-10" />
                    <div className="flex-1">
                        <Shimmer className="h-9 w-64 mb-2" />
                        <Shimmer className="h-5 w-96" variant="text" />
                    </div>
                </div>

                {/* Info Cards Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <Shimmer className="h-4 w-24 mb-2" variant="text" />
                            <Shimmer className="h-8 w-32" />
                        </div>
                    ))}
                </div>

                {/* Main Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart/Graph Section */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <Shimmer className="h-7 w-48 mb-4" />
                        <Shimmer className="h-64 w-full" />
                    </div>

                    {/* Details Section */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <Shimmer className="h-7 w-40 mb-4" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i}>
                                    <Shimmer className="h-4 w-32 mb-2" variant="text" />
                                    <Shimmer className="h-6 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
