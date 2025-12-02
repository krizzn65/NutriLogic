import React from "react";
import Shimmer from "../ui/Shimmer";

export default function ConsultationListSkeleton() {
    return (
        <div className="flex h-full bg-white overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="flex-col h-full bg-white border-r border-slate-200 w-full md:w-[400px] flex-shrink-0 flex">
                {/* Header Section */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <Shimmer className="h-6 w-32" />
                        <Shimmer className="w-8 h-8 rounded-full" />
                    </div>

                    {/* Search Bar */}
                    <div className="mb-3">
                        <Shimmer className="h-10 w-full rounded-lg" />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-1">
                        <Shimmer className="h-8 flex-1 rounded-md" />
                        <Shimmer className="h-8 flex-1 rounded-md" />
                        <Shimmer className="h-8 flex-1 rounded-md" />
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <Shimmer className="w-12 h-12 rounded-full flex-shrink-0" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex justify-between">
                                    <Shimmer className="h-4 w-32" />
                                    <Shimmer className="h-3 w-12" />
                                </div>
                                <Shimmer className="h-3 w-full" />
                                <Shimmer className="h-3 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Placeholder Skeleton (Hidden on mobile if list is shown, but skeleton usually shows desktop view or generic) */}
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-slate-50">
                <div className="w-80 h-80 mb-6 rounded-full bg-slate-200/50 flex items-center justify-center">
                    <Shimmer className="w-40 h-40 rounded-full opacity-50" />
                </div>
                <Shimmer className="h-8 w-64 mb-3" />
                <Shimmer className="h-4 w-96" />
                <Shimmer className="h-4 w-80 mt-2" />
            </div>
        </div>
    );
}
