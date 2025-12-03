import React from 'react';
import Shimmer from '../ui/Shimmer';

export default function StatsSkeleton() {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-sm p-6 border border-blue-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Shimmer className="w-9 h-9 rounded-lg" />
                <div className="flex-1">
                    <Shimmer className="h-6 w-40 mb-2" variant="text" />
                    <Shimmer className="h-4 w-24" variant="text" />
                </div>
            </div>

            {/* Compliance Rate */}
            <div className="mb-6">
                <div className="flex items-end justify-between mb-2">
                    <Shimmer className="h-4 w-32" variant="text" />
                    <Shimmer className="h-9 w-20" variant="text" />
                </div>

                {/* Progress Bar */}
                <Shimmer className="h-4 w-full rounded-full" />

                <Shimmer className="h-3 w-48 mt-2" variant="text" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-4 border border-gray-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <Shimmer className="w-9 h-9 rounded-lg mb-2" />
                            <Shimmer className="h-8 w-12 mb-1" variant="text" />
                            <Shimmer className="h-3 w-16" variant="text" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Insight Placeholder */}
            <div className="mt-4">
                <Shimmer className="h-12 w-full rounded-lg" />
            </div>
        </div>
    );
}
