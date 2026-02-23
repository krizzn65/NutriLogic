import React from "react";
import Shimmer from "../ui/Shimmer";

export default function DashboardKaderSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-montserrat">
            {/* Header Skeleton - matching PageHeader */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <Shimmer className="h-6 w-40 mb-2" />
                    <Shimmer className="h-3 w-28" variant="text" />
                </div>
                <div className="flex items-center gap-4">
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

            {/* Main Content */}
            <div className="p-3 md:p-6">
                <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto">

                    {/* Hero Section Skeleton */}
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl p-8 md:p-10 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="max-w-2xl">
                                <Shimmer className="h-5 w-28 mb-4 bg-white/30 rounded-full" delay={0} />
                                <Shimmer className="h-9 w-72 mb-3 bg-white/30" delay={50} />
                                <Shimmer className="h-5 w-96 bg-white/30" variant="text" delay={100} />
                            </div>
                            <div className="hidden md:block text-right">
                                <Shimmer className="h-4 w-16 mb-2 bg-white/30" delay={150} />
                                <Shimmer className="h-7 w-48 bg-white/30" delay={200} />
                            </div>
                        </div>
                    </div>

                    {/* Stat Cards Skeleton - 3 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <Shimmer className="h-12 w-12 rounded-2xl" delay={i * 50} />
                                    <Shimmer className="h-5 w-16 rounded-full" delay={i * 50 + 25} />
                                </div>
                                <div>
                                    <Shimmer className="h-10 w-16 mb-2" delay={i * 50 + 50} />
                                    <Shimmer className="h-4 w-36" variant="text" delay={i * 50 + 75} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Grid: Chart + Agenda */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                        {/* Pie Chart Skeleton */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <Shimmer className="h-6 w-48 mb-2" delay={0} />
                                    <Shimmer className="h-4 w-64" variant="text" delay={50} />
                                </div>
                                <Shimmer className="h-9 w-28 rounded-xl" delay={100} />
                            </div>

                            <div className="flex flex-col lg:flex-row items-center gap-8">
                                {/* Donut placeholder */}
                                <div className="w-full lg:w-1/2 h-64 flex items-center justify-center">
                                    <div className="w-56 h-56 rounded-full border-[20px] border-gray-100 relative">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <Shimmer className="h-8 w-12 mb-1" delay={150} />
                                            <Shimmer className="h-3 w-16" variant="text" delay={200} />
                                        </div>
                                    </div>
                                </div>

                                {/* Legend grid */}
                                <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl">
                                            <div className="flex items-center gap-2.5">
                                                <Shimmer className="w-3 h-3" variant="circle" delay={250 + i * 30} />
                                                <Shimmer className="h-4 w-20" variant="text" delay={280 + i * 30} />
                                            </div>
                                            <Shimmer className="h-4 w-6" delay={310 + i * 30} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Agenda Skeleton */}
                        <div className="col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <Shimmer className="h-6 w-20 mb-2" delay={0} />
                                    <Shimmer className="h-4 w-40" variant="text" delay={50} />
                                </div>
                                <Shimmer className="h-8 w-24 rounded-lg" delay={100} />
                            </div>

                            <div className="flex-1 space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-4 rounded-2xl border border-gray-100">
                                        <div className="flex items-start gap-4">
                                            <Shimmer className="min-w-[60px] h-[60px] rounded-xl" delay={150 + i * 80} />
                                            <div className="flex-1">
                                                <Shimmer className="h-4 w-3/4 mb-2" delay={200 + i * 80} />
                                                <Shimmer className="h-3 w-1/2" variant="text" delay={240 + i * 80} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                <Shimmer className="h-4 w-40 mx-auto" variant="text" delay={500} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
