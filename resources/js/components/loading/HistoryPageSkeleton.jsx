import React from "react";
import Shimmer from "../ui/Shimmer";
import PageHeader from "../dashboard/PageHeader";

export default function HistoryPageSkeleton() {
    return (
        <div className="flex flex-col w-full h-full bg-white overflow-x-hidden">
            {/* Header Skeleton */}
            <div className="px-4 pt-5 md:px-10 md:pt-10 pb-2 bg-white z-10">
                <div className="mb-2">
                    <Shimmer className="h-9 w-48 mb-2" />
                    <Shimmer className="h-5 w-32" variant="text" />
                </div>

                {/* Filter Bar Skeleton */}
                <div className="mt-6 flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Shimmer className="h-9 w-32 rounded-full" />
                        <Shimmer className="h-9 w-32 rounded-full" />
                        <Shimmer className="h-9 w-40 rounded-full" />
                    </div>
                    <div className="w-full md:w-auto flex gap-2">
                        <Shimmer className="h-9 w-32 rounded-full" />
                        <Shimmer className="h-9 w-32 rounded-full" />
                    </div>
                </div>
            </div>

            {/* List Items Skeleton */}
            <div className="flex-1 overflow-y-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white border-b border-gray-100">
                        <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center gap-4">
                            {/* Icon & Basic Info */}
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <Shimmer className="w-10 h-10 rounded-full" />
                                <div>
                                    <Shimmer className="h-5 w-32 mb-1" />
                                    <Shimmer className="h-3 w-24" />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <Shimmer className="h-4 w-3/4 mb-2" />
                                <Shimmer className="h-3 w-1/2" />
                            </div>

                            {/* Date & Time */}
                            <div className="text-right min-w-[120px]">
                                <Shimmer className="h-4 w-24 mb-1 ml-auto" />
                                <Shimmer className="h-3 w-32 ml-auto" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
