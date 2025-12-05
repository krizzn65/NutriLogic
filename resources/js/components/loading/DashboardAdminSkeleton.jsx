import React from "react";
import Shimmer from "../ui/Shimmer";

export default function DashboardAdminSkeleton() {
    return (
        <div className="flex flex-col flex-1 w-full h-full bg-gray-50/50 overflow-hidden font-montserrat">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <Shimmer className="h-6 w-48 mb-2" />
                    <Shimmer className="h-3 w-32" variant="text" />
                </div>
                <div className="flex items-center gap-4">
                    <Shimmer className="h-9 w-40 rounded-full hidden md:block" />
                    <Shimmer className="h-9 w-9 rounded-full" />
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="hidden md:block text-right">
                            <Shimmer className="h-4 w-24 mb-1" variant="text" />
                            <Shimmer className="h-3 w-16 ml-auto" variant="text" />
                        </div>
                        <Shimmer className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-7xl mx-auto flex flex-col gap-4">

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <Shimmer className="h-10 w-10 rounded-lg" />
                                    <Shimmer className="h-5 w-16 rounded-full" />
                                </div>
                                <div>
                                    <Shimmer className="h-8 w-24 mb-2" />
                                    <Shimmer className="h-3 w-32" variant="text" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

                        {/* Status Distribution Skeleton */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <Shimmer className="h-6 w-48 mb-2" />
                                    <Shimmer className="h-3 w-32" variant="text" />
                                </div>
                                <Shimmer className="h-5 w-5 rounded-full" />
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-end mb-2">
                                            <Shimmer className="h-4 w-20" variant="text" />
                                            <Shimmer className="h-4 w-12" variant="text" />
                                        </div>
                                        <Shimmer className="h-2.5 w-full rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Risk Analysis Skeleton */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="p-5 border-b border-gray-50">
                                <Shimmer className="h-5 w-40 mb-2" />
                                <Shimmer className="h-3 w-32" variant="text" />
                            </div>
                            <div className="flex-1 p-4 space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Shimmer className="h-8 w-8 rounded-lg" />
                                            <Shimmer className="h-4 w-32" variant="text" />
                                        </div>
                                        <Shimmer className="h-6 w-12 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
