import React from "react";
import Shimmer from "../ui/Shimmer";

export default function HistoryPageSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-48 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Filter Tabs Skeleton */}
                <div className="flex gap-2 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Shimmer key={i} className="h-10 w-32" />
                    ))}
                </div>

                {/* Timeline Skeleton */}
                <div className="space-y-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            {/* Timeline dot */}
                            <div className="flex flex-col items-center">
                                <Shimmer className="h-10 w-10 rounded-full" />
                                {i < 5 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                            </div>
                            {/* Content */}
                            <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <Shimmer className="h-5 w-64 mb-2" />
                                <Shimmer className="h-4 w-full mb-2" variant="text" />
                                <Shimmer className="h-4 w-3/4 mb-3" variant="text" />
                                <Shimmer className="h-3 w-32" variant="text" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
