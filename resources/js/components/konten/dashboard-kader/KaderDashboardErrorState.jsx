import React from "react";
import { AlertTriangle } from "lucide-react";

export default function KaderDashboardErrorState({ error, onRetry }) {
    return (
        <div className="flex flex-1 w-full min-h-full font-montserrat">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
                    <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-800 font-medium mb-4">{error}</p>
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        </div>
    );
}
