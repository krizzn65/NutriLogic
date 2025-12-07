import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "../../lib/utils";

const dayNames = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];

export function DatePicker({ value, onChange, placeholder = "Pilih Tanggal", className }) {
    const [date, setDate] = useState(value ? new Date(value) : new Date());
    const [isOpen, setIsOpen] = useState(false);

    // Sync internal state with prop
    useEffect(() => {
        if (value) {
            setDate(new Date(value));
        }
    }, [value]);

    const [viewDate, setViewDate] = useState(date); // For navigating months without changing selection

    const nextMonth = (e) => {
        e.preventDefault();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const prevMonth = (e) => {
        e.preventDefault();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleSelectDate = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(newDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${d}`;

        onChange(dateString);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.preventDefault();
        onChange("");
        setIsOpen(false);
    };

    const handleCancel = (e) => {
        e.preventDefault();
        setIsOpen(false);
    };

    const currentMonthName = viewDate.toLocaleString("id-ID", { month: "long" });
    const currentYear = viewDate.getFullYear();

    const daysInMonth = new Date(currentYear, viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, viewDate.getMonth(), 1).getDay();

    const renderDays = () => {
        const days = [];

        // Empty cells
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const isSelected = value &&
                new Date(value).getDate() === i &&
                new Date(value).getMonth() === viewDate.getMonth() &&
                new Date(value).getFullYear() === viewDate.getFullYear();

            const isToday =
                new Date().getDate() === i &&
                new Date().getMonth() === viewDate.getMonth() &&
                new Date().getFullYear() === viewDate.getFullYear();

            days.push(
                <button
                    key={i}
                    onClick={() => handleSelectDate(i)}
                    className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all",
                        isSelected
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-200"
                            : isToday
                                ? "bg-blue-50 text-blue-600 font-bold border border-blue-200"
                                : "text-gray-700 hover:bg-gray-100"
                    )}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        return d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm",
                        className
                    )}
                >
                    <Icon icon="lucide:calendar" className="text-gray-400 w-4 h-4" />
                    <span className={value ? "text-gray-900" : "text-gray-400"}>
                        {formatDateDisplay(value) || placeholder}
                    </span>
                    {value && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear(e);
                            }}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                            <Icon icon="lucide:x" className="text-gray-500 w-3 h-3" />
                        </button>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-4 w-auto bg-white shadow-xl border border-gray-100 rounded-xl z-50" align="start">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-800 capitalize">
                        {currentMonthName} {currentYear}
                    </span>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-md text-gray-600">
                            <Icon icon="lucide:chevron-left" width="16" height="16" />
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-md text-gray-600">
                            <Icon icon="lucide:chevron-right" width="16" height="16" />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {dayNames.map((day) => (
                        <div key={day} className="text-[10px] font-semibold text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                    {renderDays()}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={handleClear}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Hapus
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
