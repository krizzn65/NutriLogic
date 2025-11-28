import React from 'react';
import { Icon } from '@iconify/react';

const Sparkline = ({ color = "white" }) => (
    <svg width="100%" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
        <path
            d="M0 30 C 20 30, 20 10, 40 10 C 60 10, 60 35, 80 35 C 100 35, 100 5, 120 5"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
        />
        <path
            d="M0 30 C 20 30, 20 10, 40 10 C 60 10, 60 35, 80 35 C 100 35, 100 5, 120 5 V 40 H 0 Z"
            fill={`url(#gradient-${color})`}
            opacity="0.2"
        />
        <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
        </defs>
    </svg>
);

const StatItem = ({ title, value, percentage, icon, isLast }) => (
    <div className={`relative flex flex-col justify-between p-4 md:p-6 ${!isLast ? 'border-b md:border-b-0 md:border-r border-white/20' : ''}`}>
        <div className="flex flex-col z-10">
            <span className="text-white/90 text-xs md:text-sm font-medium mb-1">{title}</span>
            <h3 className="text-white text-2xl md:text-3xl font-bold mb-2">{value}</h3>

            <div className="flex items-center gap-1 bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                <Icon icon="lucide:trending-up" className="text-white w-3 h-3" />
                <span className="text-white text-[10px] font-bold">{percentage}</span>
            </div>
        </div>

        <div className="absolute bottom-2 right-0 w-1/2 h-12">
            <Sparkline />
        </div>
    </div>
);

export default function GreenStatsGroup({ summary }) {
    return (
        <div className="w-full bg-[#84cc16] rounded-[30px] shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 relative">
                {/* Background Pattern/Glow effects could go here */}

                <StatItem
                    title="Total Anak"
                    value={summary?.total_children || 0}
                    percentage="+12.05%"
                />

                <StatItem
                    title="Anak Berisiko"
                    value={summary?.at_risk_count || 0}
                    percentage="+5.19%"
                />

                <StatItem
                    title="Jadwal"
                    value={summary?.upcoming_count || 0}
                    percentage="+22.01%"
                    isLast={true}
                />
            </div>
        </div>
    );
}
