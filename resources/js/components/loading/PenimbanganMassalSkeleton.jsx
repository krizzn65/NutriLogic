import React from "react";
import Shimmer from "../ui/Shimmer";

export default function PenimbanganMassalSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-64 mb-3" />
                    <Shimmer className="h-5 w-80" variant="text" />
                </div>

                {/* Session Info Skeleton */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Shimmer className="h-4 w-24 mb-2" variant="text" />
                            <Shimmer className="h-6 w-32" />
                        </div>
                        <div>
                            <Shimmer className="h-4 w-24 mb-2" variant="text" />
                            <Shimmer className="h-6 w-32" />
                        </div>
                        <div>
                            <Shimmer className="h-4 w-24 mb-2" variant="text" />
                            <Shimmer className="h-6 w-32" />
                        </div>
                    </div>
                </div>

                {/* Children List Skeleton */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <Shimmer className="h-6 w-48" />
                        <Shimmer className="h-10 w-32" />
                    </div>
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <Shimmer className="h-5 w-48 mb-2" />
                                        <Shimmer className="h-4 w-32" variant="text" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Shimmer className="h-10 w-24" />
                                        <Shimmer className="h-10 w-24" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
