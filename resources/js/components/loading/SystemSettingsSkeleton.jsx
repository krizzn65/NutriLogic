import React from "react";
import Shimmer from "../ui/Shimmer";

export default function SystemSettingsSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-64 mb-3" />
                    <Shimmer className="h-5 w-80" variant="text" />
                </div>

                {/* Settings Sections Skeleton */}
                <div className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <Shimmer className="h-6 w-48 mb-4" />
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <div key={j} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex-1">
                                            <Shimmer className="h-4 w-40 mb-2" />
                                            <Shimmer className="h-3 w-64" variant="text" />
                                        </div>
                                        <Shimmer className="h-10 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save Button Skeleton */}
                <div className="flex justify-end gap-3">
                    <Shimmer className="h-10 w-24" />
                    <Shimmer className="h-10 w-32" />
                </div>
            </div>
        </div>
    );
}
