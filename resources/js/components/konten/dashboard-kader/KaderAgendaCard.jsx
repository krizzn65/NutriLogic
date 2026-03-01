import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function KaderAgendaCard({
    allSchedules,
    onNavigateJadwal,
    onOpenCalendar,
}) {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const upcomingSchedules = allSchedules
        .filter(
            (schedule) =>
                schedule.status !== "completed" &&
                new Date(schedule.scheduled_for) >= today,
        )
        .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));

    return (
        <div className="col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-xl text-gray-900">Agenda</h3>
                    <p className="text-gray-500 mt-1 text-sm">
                        Jadwal kegiatan terdekat
                    </p>
                </div>
                <button
                    onClick={onNavigateJadwal}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                    LIHAT SEMUA
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {upcomingSchedules.slice(0, 5).map((schedule, index) => {
                    const isToday =
                        new Date(schedule.scheduled_for).toDateString() ===
                        new Date().toDateString();

                    return (
                        <motion.div
                            key={schedule.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.05,
                                duration: 0.2,
                            }}
                            className={`group p-4 rounded-2xl border transition-all duration-300 ${isToday ? "bg-blue-50/50 border-blue-100 hover:border-blue-200" : "bg-white border-gray-100 hover:border-blue-100 hover:shadow-md"}`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl border ${isToday ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-700 border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600"}`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">
                                        {new Date(
                                            schedule.scheduled_for,
                                        ).toLocaleDateString("id-ID", {
                                            month: "short",
                                        })}
                                    </span>
                                    <span className="text-2xl font-bold leading-none">
                                        {new Date(
                                            schedule.scheduled_for,
                                        ).getDate()}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0 py-0.5">
                                    {isToday && (
                                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold tracking-wide mb-1.5">
                                            HARI INI
                                        </span>
                                    )}
                                    <h4
                                        className={`font-bold text-sm leading-tight mb-1 ${isToday ? "text-blue-900" : "text-gray-900"}`}
                                    >
                                        {schedule.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                            {new Date(
                                                schedule.scheduled_for,
                                            ).toLocaleTimeString("en-GB", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        {schedule.location && (
                                            <span className="truncate max-w-[120px] flex items-center gap-1 before:content-['-'] before:mx-1">
                                                {schedule.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {upcomingSchedules.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium">Tidak ada jadwal mendatang</p>
                        <p className="text-sm mt-1">Istirahat sejenak!</p>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <button
                    onClick={onOpenCalendar}
                    className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 w-full"
                >
                    <CalendarIcon className="w-4 h-4" />
                    Buka Kalender Lengkap
                </button>
            </div>
        </div>
    );
}
