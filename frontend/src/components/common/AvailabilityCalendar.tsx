import React, { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    isWithinInterval,
    isBefore,
    startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AvailabilityCalendarProps {
    unavailableDates: { startDate: string | Date; endDate: string | Date; type: string }[];
    onDateSelect: (start: Date | null, end: Date | null) => void;
    range: { startDate: Date | null; endDate: Date | null };
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ unavailableDates, onDateSelect, range }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const blockedIntervals = unavailableDates.map(d => ({
        start: startOfDay(new Date(d.startDate)),
        end: startOfDay(new Date(d.endDate))
    }));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                <span className="font-bold text-gray-700">{format(currentMonth, 'MMMM yyyy')}</span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
            </div>
        );
    };

    const isDateBlocked = (date: Date) => {
        return blockedIntervals.some(interval =>
            isWithinInterval(date, { start: interval.start, end: interval.end })
        );
    };

    const isDateSelected = (date: Date) => {
        if (range.startDate && isSameDay(date, range.startDate)) return true;
        if (range.endDate && isSameDay(date, range.endDate)) return true;

        if (range.startDate && range.endDate) {
            return isWithinInterval(date, { start: range.startDate, end: range.endDate });
        }
        return false;
    };

    const handleDateClick = (day: Date) => {
        if (isDateBlocked(day) || isBefore(day, startOfDay(new Date()))) return;

        if (!range.startDate || (range.startDate && range.endDate)) {
            
            onDateSelect(day, null);
        } else if (range.startDate && !range.endDate) {
            
            if (isBefore(day, range.startDate)) {
                onDateSelect(day, range.startDate);
            } else {
                
                const isOverlapping = blockedIntervals.some(b =>
                    (b.start >= range.startDate! && b.start <= day) ||
                    (b.end >= range.startDate! && b.end <= day) ||
                    (b.start <= range.startDate! && b.end >= day)
                );

                if (isOverlapping) {

                    onDateSelect(day, null);
                } else {
                    onDateSelect(range.startDate, day);
                }
            }
        }
    };

    const renderDays = () => {
        const startDate = startOfWeek(startOfMonth(currentMonth));
        const endDate = endOfWeek(endOfMonth(currentMonth));
        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const blocked = isDateBlocked(day) || isBefore(day, startOfDay(new Date()));
                const selected = isDateSelected(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                days.push(
                    <div
                        key={day.toString()}
                        className={`
                            relative h-10 w-10 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-colors
                            ${!isCurrentMonth ? "text-gray-300" : ""}
                            ${blocked ? "bg-gray-100 text-gray-300 cursor-not-allowed decoration-slice" : "hover:bg-green-50"}
                            ${selected && !blocked ? "bg-green-600 text-white hover:bg-green-700" : ""}
                        `}
                        onClick={() => !blocked && handleDateClick(cloneDay)}
                    >
                        {formattedDate}
                        {blocked && isCurrentMonth && <div className="absolute w-full h-[1px] bg-gray-300 rotate-45"></div>}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1 mb-1" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div>
                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-gray-500 uppercase">
                    {weekDays.map(d => <div key={d}>{d}</div>)}
                </div>
                {rows}
            </div>
        );
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            {renderHeader()}
            {renderDays()}
            <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-center">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-white border border-gray-200"></div> Available</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-600"></div> Selected</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-200 diagonal-line"></div> Unavailable</div>
            </div>
        </div>
    );
};
