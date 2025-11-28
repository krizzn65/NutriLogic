import React from "react";
import Shimmer from "../ui/Shimmer";

export default function SettingsPageSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-40 mb-3" />
                    <Shimmer className="h-5 w-72" variant="text" />
                </div>

                {/* Settings Tabs Skeleton */}
                <div className="flex gap-2 border-b border-gray-200 mb-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Shimmer key={i} className="h-10 w-32" />
                    ))}
                </div>

                {/* Settings Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <Shimmer className="h-24 w-24 rounded-full mx-auto mb-4" />
                            <Shimmer className="h-5 w-32 mx-auto mb-2" />
                            <Shimmer className="h-4 w-40 mx-auto" variant="text" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <Shimmer className="h-6 w-48 mb-4" />
                                <div className="space-y-4">
                                    {Array.from({ length: 2 }).map((_, j) => (
                                        <div key={j}>
                                            <Shimmer className="h-4 w-32 mb-2" variant="text" />
                                            <Shimmer className="h-10 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <Shimmer className="h-10 w-24" />
                            <Shimmer className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
