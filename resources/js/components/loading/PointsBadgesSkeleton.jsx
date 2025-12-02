import React from "react";
import Shimmer from "../ui/Shimmer";
import PageHeader from "../dashboard/PageHeader";

export default function PointsBadgesSkeleton() {
    return (
        <div className="p-4 md:p-10 w-full h-full bg-slate-50 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Shimmer className="h-9 w-64 mb-2" />
                <Shimmer className="h-5 w-48" variant="text" />
            </div>

            <div className="w-full space-y-8">
                {/* Top Section: Membership Card & Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Membership Card Skeleton */}
                    <div className="lg:col-span-7">
                        <div className="relative w-full aspect-[2.2/1] rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-sm p-8 md:p-10 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Shimmer className="h-4 w-32 mb-2" />
                                    <Shimmer className="h-8 w-48" />
                                </div>
                                <Shimmer className="w-16 h-16 rounded-full" />
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-end gap-3">
                                    <Shimmer className="h-16 w-40" />
                                    <Shimmer className="h-6 w-12 mb-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Shimmer className="h-4 w-24" />
                                        <Shimmer className="h-4 w-32" />
                                    </div>
                                    <Shimmer className="h-3 w-full rounded-full" />
                                    <Shimmer className="h-3 w-48 ml-auto" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="lg:col-span-5 grid grid-cols-2 lg:flex lg:flex-col gap-4 lg:gap-6 h-full">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-3xl p-4 md:p-8 border border-slate-100 shadow-lg flex flex-col md:flex-row items-center gap-3 md:gap-6 flex-1">
                                <Shimmer className="w-16 h-16 rounded-2xl" />
                                <div className="flex-1 w-full">
                                    <Shimmer className="h-4 w-24 mb-2 mx-auto md:mx-0" />
                                    <Shimmer className="h-8 w-32 mx-auto md:mx-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badges Collection Skeleton */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-8">
                        <div>
                            <Shimmer className="h-8 w-32 mb-2" />
                            <Shimmer className="h-4 w-48" />
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                                <Shimmer key={i} className="h-9 w-24 rounded-full" />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center gap-4">
                                <Shimmer className="w-24 h-24 rounded-full" />
                                <div className="w-full space-y-2">
                                    <Shimmer className="h-5 w-3/4 mx-auto" />
                                    <Shimmer className="h-3 w-full" />
                                    <Shimmer className="h-3 w-2/3 mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
