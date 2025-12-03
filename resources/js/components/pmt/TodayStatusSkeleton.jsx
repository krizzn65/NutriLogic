import React from 'react';
import Shimmer from '../ui/Shimmer';

export default function TodayStatusSkeleton() {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 md:p-10 border-2 border-blue-200">
            {/* Question */}
            <div className="text-center mb-6 md:mb-8 space-y-3">
                <Shimmer className="h-8 md:h-10 w-3/4 mx-auto" variant="text" />
                <Shimmer className="h-5 w-1/2 mx-auto" variant="text" />
            </div>

            {/* Status Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="relative p-5 md:p-7 rounded-2xl border-2 border-gray-200 bg-white min-h-[120px] md:min-h-[140px]"
                    >
                        <div className="flex flex-col items-center gap-2 md:gap-3">
                            <Shimmer className="w-12 h-12 md:w-14 md:h-14 rounded-full" />
                            <Shimmer className="w-9 h-9 rounded-lg" />
                            <Shimmer className="h-5 w-20" variant="text" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
