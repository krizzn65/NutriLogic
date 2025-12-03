import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../lib/api';
import CalendarSkeleton from './CalendarSkeleton';
import NoPMTDataEmptyState from './NoPMTDataEmptyState';

const PMTCalendar = memo(function PMTCalendar({ childId }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (childId) {
            fetchLogs();
        }
    }, [childId, currentDate]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/pmt-logs/child/${childId}`, {
                params: {
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear(),
                }
            });
            setLogs(response.data.data || []);
        } catch (error) {
            console.error('Error fetching PMT logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const getStatusForDate = (day) => {
        const dateStr = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        ).toISOString().split('T')[0];

        const log = logs.find(l => l.date === dateStr);
        return log?.status || null;
    };

    const getStatusColor = (status) => {
        const colors = {
            consumed: 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-700',
            partial: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-yellow-700',
            refused: 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-500 border-gray-200';
    };

    const getStatusEmoji = (status) => {
        const emojis = {
            consumed: '✓',
            partial: '~',
            refused: '✗',
        };
        return emojis[status] || '';
    };

    const getStatusHoverColor = (status) => {
        const hoverColors = {
            consumed: 'hover:from-green-600 hover:to-green-700',
            partial: 'hover:from-yellow-600 hover:to-yellow-700',
            refused: 'hover:from-red-600 hover:to-red-700',
        };
        return hoverColors[status] || '';
    };

    const previousMonth = useCallback(() => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }, [currentDate]);

    const nextMonth = useCallback(() => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    }, [currentDate]);

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    const today = new Date();
    const isCurrentMonth =
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

    if (loading) {
        return <CalendarSkeleton />;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-gray-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl shadow-sm">
                        <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                        Kalender PMT
                    </h3>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <motion.button
                        onClick={previousMonth}
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Bulan sebelumnya"
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" aria-hidden="true" />
                    </motion.button>

                    <motion.div 
                        key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 rounded-xl sm:min-w-[180px] text-center border border-gray-200"
                    >
                        <span className="font-bold text-sm md:text-base text-gray-900">
                            {currentDate.toLocaleDateString('id-ID', {
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </motion.div>

                    <motion.button
                        onClick={nextMonth}
                        whileHover={{ scale: 1.1, x: 2 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Bulan berikutnya"
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" aria-hidden="true" />
                    </motion.button>
                </div>
            </div>

            {/* Calendar Grid */}
            {logs.length === 0 ? (
                <NoPMTDataEmptyState />
            ) : (
                <div role="region" aria-label="Kalender PMT bulanan">
                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 gap-2 mb-3" role="row">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs md:text-sm font-bold text-gray-600 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-2" role="grid" aria-label="Hari dalam bulan">
                        {/* Empty cells for days before month starts */}
                        {emptyDays.map((_, index) => (
                            <div key={`empty-${index}`} className="aspect-square" />
                        ))}

                        {/* Actual days - Enhanced with better styling and mobile optimization */}
                        {days.map((day) => {
                            const status = getStatusForDate(day);
                            const isToday = isCurrentMonth && day === today.getDate();
                            const isFuture = new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                day
                            ) > today;

                            return (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={!isFuture ? { scale: 1.1, y: -2 } : {}}
                                    whileTap={!isFuture ? { scale: 0.95 } : {}}
                                    transition={{ delay: day * 0.008 }}
                                    role="gridcell"
                                    aria-label={
                                        isFuture
                                            ? `${day} - Tanggal belum tiba`
                                            : status
                                                ? `${day} - PMT: ${status === 'consumed' ? 'Habis' : status === 'partial' ? 'Sebagian' : 'Tidak Mau'}`
                                                : `${day} - Belum ada data`
                                    }
                                    tabIndex={!isFuture ? 0 : -1}
                                    className={`aspect-square rounded-lg sm:rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 ${isFuture
                                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                        : status
                                            ? `${getStatusColor(status)} ${getStatusHoverColor(status)} shadow-md hover:shadow-xl cursor-pointer`
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg cursor-pointer'
                                        } ${isToday ? 'ring-2 sm:ring-3 ring-blue-600 ring-offset-2' : ''}`}
                                    style={{ minWidth: '44px', minHeight: '44px' }}
                                >
                                    {/* Background pattern for status days */}
                                    {status && !isFuture && (
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="absolute inset-0 bg-white transform rotate-45 scale-150"></div>
                                        </div>
                                    )}

                                    <span className={`text-sm sm:text-base font-bold ${status && !isFuture ? 'text-white' : ''} relative z-10`}>
                                        {day}
                                    </span>
                                    {status && !isFuture && (
                                        <motion.span 
                                            className="text-xs sm:text-sm mt-0.5 relative z-10"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            {getStatusEmoji(status)}
                                        </motion.span>
                                    )}

                                    {/* Today indicator dot */}
                                    {isToday && (
                                        <motion.div
                                            className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legend - Enhanced with better visual indicators */}
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t-2 border-gray-200">
                <p className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider mb-5">
                    Keterangan Status
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                    <motion.div 
                        className="flex items-center gap-2.5"
                        whileHover={{ scale: 1.05, x: 2 }}
                    >
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            ✓
                        </div>
                        <span className="text-xs md:text-sm text-gray-800 font-bold">Habis</span>
                    </motion.div>
                    <motion.div 
                        className="flex items-center gap-2.5"
                        whileHover={{ scale: 1.05, x: 2 }}
                    >
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 border-2 border-yellow-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            ~
                        </div>
                        <span className="text-xs md:text-sm text-gray-800 font-bold">Sebagian</span>
                    </motion.div>
                    <motion.div 
                        className="flex items-center gap-2.5"
                        whileHover={{ scale: 1.05, x: 2 }}
                    >
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            ✗
                        </div>
                        <span className="text-xs md:text-sm text-gray-800 font-bold">Tidak Mau</span>
                    </motion.div>
                    <motion.div 
                        className="flex items-center gap-2.5"
                        whileHover={{ scale: 1.05, x: 2 }}
                    >
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gray-100 border-2 border-gray-200 shadow-md"></div>
                        <span className="text-xs md:text-sm text-gray-800 font-bold">Belum Ada Data</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
});

export default PMTCalendar;
