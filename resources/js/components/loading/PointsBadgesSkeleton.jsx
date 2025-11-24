import React from "react";
import Shimmer from "../ui/Shimmer";

export default function PointsBadgesSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-64 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Points Summary Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <Shimmer className="h-6 w-32 mb-2" />
                            <Shimmer className="h-12 w-24 mb-2" />
                            <Shimmer className="h-4 w-48" variant="text" />
                        </div>
                        <Shimmer className="w-24 h-24" variant="circle" />
                    </div>
                </div>

                {/* Badges Grid */}
                <div>
                    <Shimmer className="h-7 w-32 mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                                <Shimmer className="w-16 h-16 mx-auto mb-3" variant="circle" />
                                <Shimmer className="h-5 w-24 mx-auto mb-2" />
                                <Shimmer className="h-4 w-32 mx-auto" variant="text" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div>
                    <Shimmer className="h-7 w-40 mb-4" />
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Shimmer className="w-10 h-10" variant="circle" />
                                    <div className="flex-1">
                                        <Shimmer className="h-5 w-48 mb-1" />
                                        <Shimmer className="h-4 w-32" variant="text" />
                                    </div>
                                    <Shimmer className="h-6 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
