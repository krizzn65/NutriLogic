import React from 'react';

export default function ScheduleList({ schedules }) {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Jadwal Terdekat</h3>
                <button className="text-blue-500 text-sm font-medium hover:text-blue-600">Lihat Semua</button>
            </div>

            <div className="space-y-4">
                {schedules && schedules.length > 0 ? (
                    schedules.map((schedule) => (
                        <div key={schedule.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${schedule.is_urgent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{schedule.title}</h4>
                                <p className="text-sm text-gray-500 truncate">{schedule.child_name} • {schedule.type}</p>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <span className={`text-sm font-bold block ${schedule.is_urgent ? 'text-red-500' : 'text-blue-500'}`}>
                                    {schedule.days_until === 0 ? 'Hari Ini' : `${schedule.days_until} Hari`}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(schedule.scheduled_for).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>Tidak ada jadwal terdekat</p>
                    </div>
                )}
            </div>
        </div>
    );
}
