import React from 'react';
import Shimmer from '../ui/Shimmer';

export default function ChildSelectorSkeleton() {
    return (
        <div className="mb-6">
            <Shimmer className="h-4 w-20 mb-2" variant="text" />
            <div className="relative">
                <Shimmer className="w-full md:w-auto min-w-[280px] h-[44px] rounded-xl" />
            </div>
        </div>
    );
}
