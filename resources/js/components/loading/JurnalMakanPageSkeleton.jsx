import React from "react";
import PageHeader from "../ui/PageHeader";
import Shimmer from "../ui/Shimmer";

export default function JurnalMakanPageSkeleton() {
    return (
        <div className="flex flex-col h-full w-full bg-gray-50/50 font-sans">
            <div className="relative z-50">
                <PageHeader title="Jurnal Makan" subtitle="Portal Orang Tua" />
            </div>
            <div className="flex-1 overflow-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Shimmer className="h-8 w-48" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="space-y-4">
                            <Shimmer className="h-12 w-full" />
                            <Shimmer className="h-64 w-full" />
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            <Shimmer className="h-32 w-full" />
                            <Shimmer className="h-64 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
