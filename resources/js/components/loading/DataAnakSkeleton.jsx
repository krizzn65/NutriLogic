import React from "react";
import Shimmer from "../ui/Shimmer";

export default function DataAnakSkeleton({ itemCount = 6 }) {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <Shimmer className="h-8 w-48 mb-2" />
                        <Shimmer className="h-4 w-64" variant="text" />
                    </div>
                    <Shimmer className="h-10 w-40 rounded-xl" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                            {/* Header: Avatar & Status */}
                            <div className="flex justify-between items-start mb-4">
                                <Shimmer className="w-16 h-16 rounded-full" />
                                <Shimmer className="h-6 w-20 rounded-full" />
                            </div>

                            {/* Child Info */}
                            <div className="mb-6">
                                <Shimmer className="h-6 w-3/4 mb-2" />
                                <Shimmer className="h-4 w-1/2" variant="text" />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                                    <Shimmer className="h-4 w-12" />
                                    <Shimmer className="h-5 w-16" />
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                                    <Shimmer className="h-4 w-12" />
                                    <Shimmer className="h-5 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
