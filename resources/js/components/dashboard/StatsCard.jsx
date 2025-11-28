import React from 'react';

export default function StatsCard({ title, value, subValue, icon, color = "blue", trend }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        yellow: "bg-yellow-50 text-yellow-600",
        red: "bg-red-50 text-red-600",
    };

    const iconBg = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white rounded-2xl md:rounded-[24px] p-3 md:p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 border border-gray-100 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${iconBg}`}>
                    {React.cloneElement(icon, { className: "text-sm md:text-xl" })}
                </div>
                {trend && (
                    <div className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}
                    </div>
                )}
            </div>

            <div>
                <p className="text-gray-500 text-[10px] md:text-sm font-medium mb-0.5 leading-tight">{title}</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 leading-tight">{value}</h3>
                {subValue && <p className="text-[9px] md:text-xs text-gray-400 mt-0.5 hidden md:block">{subValue}</p>}
            </div>
        </div>
    );
}
