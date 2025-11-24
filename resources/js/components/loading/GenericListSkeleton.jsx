import React from "react";
import Shimmer from "../ui/Shimmer";

export default function GenericListSkeleton({ itemCount = 6 }) {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-64 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Search/Filter Bar Skeleton */}
                <div className="flex gap-4 mb-4">
                    <Shimmer className="h-10 flex-1" />
                    <Shimmer className="h-10 w-32" />
                </div>

                {/* List Items Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <Shimmer className="h-6 w-40 mb-3" />
                            <Shimmer className="h-4 w-32 mb-2" variant="text" />
                            <Shimmer className="h-4 w-full mb-2" variant="text" />
                            <div className="flex gap-2 mt-4">
                                <Shimmer className="h-8 w-20" />
                                <Shimmer className="h-8 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
