import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../lib/api';
import CalendarSkeleton from './CalendarSkeleton';
import logger from "../../lib/logger";


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
            logger.error('Error fetching PMT logs:', error);
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
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        // Robust matching: check if date starts with dateStr (handles time part)
        const log = logs.find(l => l.date && l.date.startsWith(dateStr));
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
            consumed: 'âœ“',
            partial: '~',
            refused: 'âœ—',
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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Kalender PMT</h3>
                    <p className="text-sm text-gray-500 capitalize">
                        {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col justify-center">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {emptyDays.map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square" />
                    ))}

                    {days.map((day) => {
                        const status = getStatusForDate(day);
                        const isToday = isCurrentMonth && day === today.getDate();
                        const isFuture = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) > today;

                        let bgClass = 'bg-gray-50 text-gray-700 hover:bg-gray-100';
                        if (status === 'consumed') bgClass = 'bg-green-500 text-white shadow-md shadow-green-200';
                        if (status === 'partial') bgClass = 'bg-yellow-500 text-white shadow-md shadow-yellow-200';
                        if (status === 'refused') bgClass = 'bg-red-500 text-white shadow-md shadow-red-200';
                        if (isFuture) bgClass = 'bg-transparent text-gray-300';

                        return (
                            <div
                                key={day}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative ${bgClass} ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                            >
                                <span className="text-sm font-medium">{day}</span>
                                {status && (
                                    <span className="text-[10px] leading-none mt-0.5">
                                        {status === 'consumed' && 'âœ“'}
                                        {status === 'partial' && '~'}
                                        {status === 'refused' && 'âœ—'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DEBUG: Remove after fixing */}
            {/* <div className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                <p className="font-bold">Debug Logs:</p>
                <pre>{JSON.stringify(logs, null, 2)}</pre>
            </div> */}
        </div>
    );
});

export default PMTCalendar;

