import React from "react";
import Shimmer from "../ui/Shimmer";

export default function DashboardOrangTuaSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Greeting Section Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-64 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Summary Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <Shimmer className="w-12 h-12 mb-4" />
                            <Shimmer className="h-4 w-24 mb-2" variant="text" />
                            <Shimmer className="h-8 w-16" />
                        </div>
                    ))}
                </div>

                {/* Children Cards Section Skeleton */}
                <div>
                    <Shimmer className="h-7 w-32 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <Shimmer className="h-6 w-40 mb-2" />
                                <Shimmer className="h-4 w-32 mb-4" variant="text" />
                                <Shimmer className="h-4 w-24 mb-2" variant="text" />
                                <Shimmer className="h-6 w-36" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Schedules Section Skeleton */}
                <div>
                    <Shimmer className="h-7 w-40 mb-4" />
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                                    <Shimmer className="w-12 h-12" variant="circle" />
                                    <div className="flex-1">
                                        <Shimmer className="h-5 w-48 mb-2" />
                                        <Shimmer className="h-4 w-32 mb-1" variant="text" />
                                        <Shimmer className="h-3 w-40" variant="text" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
