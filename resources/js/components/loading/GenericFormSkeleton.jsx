import React from "react";
import Shimmer from "../ui/Shimmer";

export default function GenericFormSkeleton({ fieldCount = 8 }) {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-64 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Form Card Skeleton */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-2xl">
                    <div className="space-y-6">
                        {Array.from({ length: fieldCount }).map((_, i) => (
                            <div key={i}>
                                <Shimmer className="h-4 w-32 mb-2" variant="text" />
                                <Shimmer className="h-10 w-full" />
                            </div>
                        ))}

                        {/* Action Buttons Skeleton */}
                        <div className="flex gap-3 pt-4">
                            <Shimmer className="h-10 w-24" />
                            <Shimmer className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
