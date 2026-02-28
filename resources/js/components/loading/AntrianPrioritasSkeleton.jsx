import React from "react";
import Shimmer from "../ui/Shimmer";

export default function AntrianPrioritasSkeleton({ cardCount = 6 }) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-montserrat">
            {/* Header Skeleton — matching PageHeader */}
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

                    {/* Summary Card Skeleton — Admin style */}
                    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <Shimmer className="h-12 w-12 rounded-2xl" delay={0} />
                            <Shimmer className="h-5 w-28 rounded-full" delay={25} />
                        </div>
                        <div>
                            <Shimmer className="h-10 w-14 mb-2" delay={50} />
                            <Shimmer className="h-4 w-56" variant="text" delay={75} />
                        </div>
                    </div>

                    {/* Search Bar Skeleton */}
                    <Shimmer className="h-12 w-full rounded-2xl" delay={100} />

                    {/* Children Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {Array.from({ length: cardCount }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col">
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-5">
                                    <Shimmer className="w-8 h-8 shrink-0" variant="circle" delay={i * 60} />
                                    <Shimmer className="w-12 h-12 shrink-0" variant="circle" delay={i * 60 + 20} />
                                    <div>
                                        <Shimmer className="h-5 w-28 mb-1" delay={i * 60 + 40} />
                                        <Shimmer className="h-3 w-24" variant="text" delay={i * 60 + 60} />
                                    </div>
                                </div>

                                {/* PMT Compliance */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                                    <Shimmer className="h-3 w-36 mb-3" variant="text" delay={i * 60 + 80} />
                                    <Shimmer className="h-2 w-full rounded-full mb-3" delay={i * 60 + 100} />
                                    <Shimmer className="h-8 w-full rounded-lg" delay={i * 60 + 120} />
                                </div>

                                {/* Latest Data */}
                                <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 mb-4">
                                    <div className="flex justify-between mb-3">
                                        <Shimmer className="h-3 w-20" variant="text" delay={i * 60 + 140} />
                                        <Shimmer className="h-3 w-14" variant="text" delay={i * 60 + 150} />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {Array.from({ length: 4 }).map((_, j) => (
                                            <div key={j}>
                                                <Shimmer className="h-2.5 w-10 mb-1" variant="text" delay={i * 60 + 160 + j * 15} />
                                                <Shimmer className="h-4 w-14" delay={i * 60 + 175 + j * 15} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div>
                                        <Shimmer className="h-2.5 w-14 mb-1" variant="text" delay={i * 60 + 240} />
                                        <Shimmer className="h-4 w-24" delay={i * 60 + 260} />
                                    </div>
                                    <Shimmer className="h-8 w-24 rounded-lg" delay={i * 60 + 280} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
