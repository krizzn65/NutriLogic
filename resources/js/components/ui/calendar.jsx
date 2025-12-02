import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Icon } from '@iconify/react';

const dayNames = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];

const CalendarDay = ({ day, isHeader, isScheduled, isToday, isCurrentMonth }) => {
  let dayStyle = "text-gray-400"; // Default for non-current month

  if (isHeader) {
    dayStyle = "text-gray-500 font-semibold";
  } else if (isCurrentMonth) {
    if (isScheduled) {
      dayStyle = "bg-[#4481EB] text-white font-bold shadow-md shadow-blue-200";
    } else if (isToday) {
      dayStyle = "bg-blue-50 text-[#4481EB] font-bold border-2 border-[#4481EB]";
    } else {
      dayStyle = "text-gray-700 hover:bg-gray-50 cursor-pointer";
    }
  }

  return (
    <div
      className={`col-span-1 row-span-1 flex h-6 w-6 md:h-9 md:w-9 items-center justify-center ${isHeader ? "" : "rounded-lg md:rounded-xl transition-all duration-200"
        } ${dayStyle}`}>
      <span className={`font-medium ${isHeader ? "text-[8px] md:text-xs" : "text-[10px] md:text-sm"}`}>
        {day}
      </span>
    </div>
  );
};

export function Calendar({ schedules: propSchedules, currentDate: propCurrentDate, onMonthChange }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(propCurrentDate || new Date());

  useEffect(() => {
    if (propSchedules) {
      setSchedules(propSchedules);
      setLoading(false);
    } else {
      fetchSchedules();
    }
  }, [propSchedules]);

  // Sync with external currentDate
  useEffect(() => {
    if (propCurrentDate) {
      setCurrentDate(propCurrentDate);
    }
  }, [propCurrentDate]);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/parent/calendar/schedules');
      setSchedules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    if (onMonthChange) onMonthChange(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    if (onMonthChange) onMonthChange(newDate);
  };

  const currentMonthName = currentDate.toLocaleString("id-ID", { month: "long" });
  const currentYear = currentDate.getFullYear();

  // Calendar Logic
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

  // Get schedules for the current view
  const currentMonthSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.scheduled_for);
    return scheduleDate.getMonth() === currentDate.getMonth() &&
      scheduleDate.getFullYear() === currentYear;
  });

  const scheduledDayNumbers = currentMonthSchedules.map(s => new Date(s.scheduled_for).getDate());

  const today = new Date();
  const isCurrentMonthView = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentYear;

  const renderCalendarDays = () => {
    const days = [];

    // Headers
    dayNames.forEach(day => {
      days.push(<CalendarDay key={`header-${day}`} day={day} isHeader />);
    });

    // Empty cells for days before start of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-start-${i}`} className="col-span-1 row-span-1 h-6 w-6 md:h-9 md:w-9" />);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <CalendarDay
          key={`date-${i}`}
          day={i}
          isScheduled={scheduledDayNumbers.includes(i)}
          isToday={isCurrentMonthView && i === today.getDate()}
          isCurrentMonth={true}
        />
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl md:rounded-[24px] p-3 md:p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div>
          <h3 className="text-xs md:text-lg font-bold text-gray-800 capitalize">
            {currentMonthName} {currentYear}
          </h3>
          <p className="text-[8px] md:text-xs text-gray-500 mt-0.5">
            {currentMonthSchedules.length} jadwal
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
          >
            <Icon icon="lucide:chevron-left" width="14" height="14" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
          >
            <Icon icon="lucide:chevron-right" width="14" height="14" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-7 gap-0.5 md:gap-2">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-100 flex items-center justify-center gap-3 md:gap-4 text-[8px] md:text-xs">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#4481EB] shadow-sm shadow-blue-200"></div>
          <span className="text-gray-600 font-medium">Ada Jadwal</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border-2 border-[#4481EB] bg-blue-50"></div>
          <span className="text-gray-600 font-medium">Hari Ini</span>
        </div>
      </div>
    </div>
  );
}
