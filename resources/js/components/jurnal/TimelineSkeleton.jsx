import React from 'react';
import Shimmer from '../ui/Shimmer';

export default function TimelineSkeleton({ mealCount = 3 }) {
    return (
        <div className="space-y-6">
            {/* Timeline Header */}
            <div className="flex items-center gap-2 mb-4">
                <Shimmer className="h-1 flex-1 rounded-full" />
                <Shimmer className="h-4 w-32" variant="text" />
                <Shimmer className="h-1 flex-1 rounded-full" />
            </div>

            {/* Meal Time Sections */}
            {Array.from({ length: 2 }).map((_, sectionIndex) => (
                <div key={sectionIndex} className="space-y-3">
                    {/* Time Header */}
                    <div className="flex items-center gap-3">
                        <Shimmer className="w-9 h-9 rounded-lg" />
                        <Shimmer className="h-5 w-20" variant="text" />
                        <Shimmer className="flex-1 h-px" />
                    </div>

                    {/* Meal Cards */}
                    <div className="space-y-2 ml-11">
                        {Array.from({ length: mealCount }).map((_, cardIndex) => (
                            <div
                                key={cardIndex}
                                className="bg-white rounded-xl p-4 border border-gray-100"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        {/* Meal Title */}
                                        <Shimmer className="h-5 w-3/4" variant="text" />
                                        
                                        {/* Ingredients */}
                                        <Shimmer className="h-4 w-full" variant="text" />
                                        
                                        {/* Badges and Time */}
                                        <div className="flex items-center gap-2">
                                            <Shimmer className="h-6 w-20 rounded-md" />
                                            <Shimmer className="h-4 w-16" variant="text" />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-1">
                                        <Shimmer className="w-8 h-8 rounded-lg" />
                                        <Shimmer className="w-8 h-8 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
