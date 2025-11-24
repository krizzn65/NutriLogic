import React from "react";
import Shimmer from "../ui/Shimmer";

export default function NutriAssistSkeleton() {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header Skeleton */}
                <div className="mb-2">
                    <Shimmer className="h-9 w-64 mb-3" />
                    <Shimmer className="h-5 w-96" variant="text" />
                </div>

                {/* Chat Interface Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col max-h-[600px]">
                    {/* Chat Messages */}
                    <div className="flex-1 p-6 space-y-4 overflow-hidden">
                        {/* AI Message */}
                        <div className="flex gap-3">
                            <Shimmer className="w-10 h-10 flex-shrink-0" variant="circle" />
                            <div className="flex-1">
                                <Shimmer className="h-4 w-32 mb-2" variant="text" />
                                <Shimmer className="h-20 w-full" />
                            </div>
                        </div>

                        {/* User Message */}
                        <div className="flex gap-3 justify-end">
                            <div className="flex-1 max-w-md">
                                <Shimmer className="h-4 w-24 mb-2 ml-auto" variant="text" />
                                <Shimmer className="h-16 w-full" />
                            </div>
                            <Shimmer className="w-10 h-10 flex-shrink-0" variant="circle" />
                        </div>

                        {/* AI Message */}
                        <div className="flex gap-3">
                            <Shimmer className="w-10 h-10 flex-shrink-0" variant="circle" />
                            <div className="flex-1">
                                <Shimmer className="h-4 w-32 mb-2" variant="text" />
                                <Shimmer className="h-24 w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <Shimmer className="h-12 flex-1" />
                            <Shimmer className="h-12 w-12" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
