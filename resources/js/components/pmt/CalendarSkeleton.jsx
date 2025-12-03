import React from 'react';
import Shimmer from '../ui/Shimmer';

export default function CalendarSkeleton() {
    const weekDays = 7;
    const calendarRows = 5;
    const totalDays = weekDays * calendarRows;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Shimmer className="w-9 h-9 rounded-lg" />
                    <Shimmer className="h-6 w-32" variant="text" />
                </div>

                <div className="flex items-center gap-2">
                    <Shimmer className="w-9 h-9 rounded-lg" />
                    <Shimmer className="h-9 w-40 rounded-lg" />
                    <Shimmer className="w-9 h-9 rounded-lg" />
                </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {Array.from({ length: weekDays }).map((_, index) => (
                    <div key={index} className="text-center py-2">
                        <Shimmer className="h-3 w-8 mx-auto" variant="text" />
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: totalDays }).map((_, index) => (
                    <Shimmer
                        key={index}
                        className="aspect-square rounded-lg"
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <Shimmer className="h-3 w-24 mb-3" variant="text" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Shimmer className="w-6 h-6 rounded" />
                            <Shimmer className="h-4 w-16" variant="text" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
