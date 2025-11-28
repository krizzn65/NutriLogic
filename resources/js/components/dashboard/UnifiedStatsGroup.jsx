import React from 'react';
import { Icon } from '@iconify/react';

const StatItem = ({ title, value, badgeText, badgeColor, iconName, isLast }) => (
    <div className={`relative flex flex-col justify-between p-4 md:p-6 ${!isLast ? 'border-r border-white/20' : ''} overflow-hidden group min-w-[120px]`}>
        <div className="flex flex-col z-10">
            <span className="text-white/90 text-[10px] md:text-sm font-medium mb-1">{title}</span>
            <h3 className="text-white text-xl md:text-3xl font-bold mb-2">{value}</h3>

            <div className={`flex items-center gap-1 ${badgeColor || 'bg-white/20'} w-fit px-3 py-1 rounded-full backdrop-blur-sm`}>
                <span className="text-white text-[8px] md:text-[10px] font-medium tracking-wide">{badgeText}</span>
            </div>
        </div>

        {/* Large Background Icon */}
        <div className="absolute -bottom-4 -right-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <Icon icon={iconName} width="60" height="60" className="text-white md:w-[80px] md:h-[80px]" />
        </div>
    </div>
);

export default function UnifiedStatsGroup({ summary }) {
    // Logic for "Anak Berisiko"
    const riskCount = summary?.at_risk_count || 0;
    const isRiskSafe = riskCount === 0;

    const riskData = {
        title: isRiskSafe ? "Status Gizi" : "Perlu Pantauan",
        value: isRiskSafe ? "Aman" : `${riskCount} Anak`,
        icon: isRiskSafe ? "mdi:shield-check-outline" : "mdi:alert-decagram-outline",
        badgeText: isRiskSafe ? "Normal" : "Segera Periksa",
        badgeColor: isRiskSafe ? "bg-green-400/30" : "bg-red-400/30"
    };

    // Logic for "Jadwal"
    const scheduleStatus = summary?.schedule_status || { count: 0, label: 'Tidak Ada', has_schedule: false };
    const hasSchedule = scheduleStatus.has_schedule;

    const scheduleData = {
        title: "Jadwal Posyandu",
        value: hasSchedule ? `${scheduleStatus.count} Kegiatan` : "Kosong",
        icon: hasSchedule ? "mdi:calendar-clock-outline" : "mdi:calendar-blank-outline",
        badgeText: scheduleStatus.label,
        badgeColor: hasSchedule ? "bg-yellow-400/30" : "bg-white/20"
    };

    return (
        <div className="w-full bg-gradient-to-r from-[#00BFEF] to-[#006AA6] rounded-[20px] md:rounded-[30px] shadow-lg overflow-hidden">
            <div className="grid grid-cols-3 relative divide-white/20">
                <StatItem
                    title="Total Anak"
                    value={summary?.total_children || 0}
                    badgeText="Terdaftar"
                    iconName="mdi:baby-face-outline"
                />

                <StatItem
                    title={riskData.title}
                    value={riskData.value}
                    badgeText={riskData.badgeText}
                    badgeColor={riskData.badgeColor}
                    iconName={riskData.icon}
                />

                <StatItem
                    title={scheduleData.title}
                    value={scheduleData.value}
                    badgeText={scheduleData.badgeText}
                    badgeColor={scheduleData.badgeColor}
                    iconName={scheduleData.icon}
                    isLast={true}
                />
            </div>
        </div>
    );
}
