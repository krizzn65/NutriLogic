import React from "react";
import Shimmer from "../ui/Shimmer";

export default function TableSkeleton({ itemCount = 6 }) {
    return (
        <div className="flex flex-1 w-full h-full overflow-auto bg-gray-50/50">
            <div className="p-6 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header Skeleton */}
                <div className="flex justify-between items-end">
                    <div>
                        <Shimmer className="h-4 w-32 mb-2" variant="text" />
                        <Shimmer className="h-8 w-48" />
                    </div>
                    <Shimmer className="h-10 w-40 rounded-xl" />
                </div>

                {/* Search/Filter Bar Skeleton */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Shimmer className="h-3 w-20 mb-2" variant="text" />
                        <Shimmer className="h-11 w-full rounded-xl" />
                    </div>
                    <div className="w-full md:w-48">
                        <Shimmer className="h-3 w-20 mb-2" variant="text" />
                        <Shimmer className="h-11 w-full rounded-xl" />
                    </div>
                    <div className="w-full md:w-40">
                        <Shimmer className="h-3 w-20 mb-2" variant="text" />
                        <Shimmer className="h-11 w-full rounded-xl" />
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4"><Shimmer className="h-4 w-20" variant="text" /></th>
                                    <th className="px-6 py-4"><Shimmer className="h-4 w-24" variant="text" /></th>
                                    <th className="px-6 py-4"><Shimmer className="h-4 w-16" variant="text" /></th>
                                    <th className="px-6 py-4"><Shimmer className="h-4 w-24" variant="text" /></th>
                                    <th className="px-6 py-4"><Shimmer className="h-4 w-16" variant="text" /></th>
                                    <th className="px-6 py-4 text-right"><Shimmer className="h-4 w-12 ml-auto" variant="text" /></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {Array.from({ length: itemCount }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <Shimmer className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <Shimmer className="h-4 w-32 mb-1" variant="text" />
                                                    <Shimmer className="h-3 w-16" variant="text" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <Shimmer className="h-4 w-24" variant="text" />
                                                <Shimmer className="h-3 w-20" variant="text" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Shimmer className="h-6 w-20 rounded-lg" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Shimmer className="h-6 w-24 rounded-full" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shimmer className="w-2 h-2 rounded-full" />
                                                <Shimmer className="h-4 w-12" variant="text" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Shimmer className="h-8 w-16 rounded-lg" />
                                                <Shimmer className="h-8 w-16 rounded-lg" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
