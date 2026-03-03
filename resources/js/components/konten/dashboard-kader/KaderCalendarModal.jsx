import React from "react";
import { X } from "lucide-react";
import { Calendar } from "../../ui/calendar";

export default function KaderCalendarModal({
    isOpen,
    onClose,
    allSchedules,
    calendarDate,
    onMonthChange,
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto mt-6 sm:mt-0">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-10"
                    aria-label="Tutup kalender"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-full mt-2">
                    <Calendar
                        mode="single"
                        selected={new Date()}
                        className="rounded-md border-0 w-full"
                        classNames={{
                            month: "space-y-4 w-full",
                            table: "w-full",
                            head_row: "flex w-full justify-between",
                            row: "flex w-full mt-2 justify-between",
                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-11 w-11 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md flex items-center justify-center mx-auto text-base",
                        }}
                        schedules={allSchedules}
                        currentDate={calendarDate}
                        onMonthChange={onMonthChange}
                    />
                </div>
            </div>
        </div>
    );
}
