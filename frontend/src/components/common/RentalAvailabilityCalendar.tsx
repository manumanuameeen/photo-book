import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react';
import { rentalApi } from '../../services/api/rentalApi';

interface RentalAvailabilityCalendarProps {
    itemId: string;
    startDate: Date | null;
    endDate: Date | null;
    onSelectRange: (start: Date | null, end: Date | null) => void;
    className?: string;
    currentRentalStart?: Date;
    currentRentalEnd?: Date;
}

interface UnavailableDate {
    startDate: string;
    endDate: string;
    reason?: string;
    type: string;
}

export const RentalAvailabilityCalendar: React.FC<RentalAvailabilityCalendarProps> = ({
    itemId,
    startDate,
    endDate,
    onSelectRange,
    className = "",
    currentRentalStart,
    currentRentalEnd
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAvailability = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await rentalApi.getUnavailableDates(itemId);
            setUnavailableDates(data);
        } catch (error) {
            console.error("Failed to fetch availability", error);
        } finally {
            setIsLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
        if (itemId) {
            fetchAvailability();
        }
    }, [itemId, fetchAvailability]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isDateUnavailable = (date: Date) => {
        const checkTime = date.getTime();

        if (currentRentalStart && currentRentalEnd) {
            const currentStart = new Date(currentRentalStart).setHours(0, 0, 0, 0);
            const currentEnd = new Date(currentRentalEnd).setHours(23, 59, 59, 999);
            if (checkTime >= currentStart && checkTime <= currentEnd) return false;
        }

        return unavailableDates.some(range => {
            const start = new Date(range.startDate).setHours(0, 0, 0, 0);
            const end = new Date(range.endDate).setHours(23, 59, 59, 999);
            return checkTime >= start && checkTime <= end;
        });
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (isDateUnavailable(clickedDate)) return;

        if (!startDate || (startDate && endDate)) {
            onSelectRange(clickedDate, null);
        } else {

            if (clickedDate < startDate) {
                onSelectRange(clickedDate, null);
            } else {

                let valid = true;
                const temp = new Date(startDate);
                while (temp <= clickedDate) {
                    if (isDateUnavailable(temp)) {
                        valid = false;
                        break;
                    }
                    temp.setDate(temp.getDate() + 1);
                }

                if (valid) {
                    onSelectRange(startDate, clickedDate);
                } else {

                    onSelectRange(clickedDate, null);
                }
            }
        }
    };

    const getDateStatus = (day: number) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkDate < today) return 'disabled';
        if (isDateUnavailable(checkDate)) return 'unavailable';

        const toDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const checkParams = toDateString(checkDate);
        const startParams = startDate ? toDateString(new Date(startDate)) : null;
        const endParams = endDate ? toDateString(new Date(endDate)) : null;

        if (startParams && endParams) {
            if (checkParams >= startParams && checkParams <= endParams) return 'selected';
        } else if (startParams) {
            if (checkParams === startParams) return 'selected-start';
        }

        return 'available';
    };

    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <div className="font-bold text-gray-800 flex items-center gap-2">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    {isLoading && <Loader2 size={14} className="animate-spin text-green-600" />}
                </div>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronRight size={20} className="text-gray-600" />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-semibold text-gray-400 uppercase py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const status = getDateStatus(day);

                    let bgClass = "bg-white hover:bg-gray-50 border-gray-100 text-gray-700";
                    if (status === 'unavailable') bgClass = "bg-red-50 text-red-300 cursor-not-allowed border-red-100";
                    if (status === 'disabled') bgClass = "bg-gray-50 text-gray-300 cursor-not-allowed";
                    if (status === 'selected' || status === 'selected-start') bgClass = "bg-green-600 text-white font-bold border-green-600 shadow-md";
                    if (status === 'available') bgClass = "bg-white border-green-100 hover:border-green-500 hover:shadow-sm cursor-pointer";

                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={status === 'unavailable' || status === 'disabled'}
                            onClick={() => handleDateClick(day)}
                            className={`
                                aspect-square rounded-lg border flex items-center justify-center text-sm transition-all duration-200
                                ${bgClass}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500 justify-center">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-600"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-50 border border-red-100 text-red-300"></div>
                    <span>Unavailable</span>
                </div>
            </div>
            <div className="mt-3 bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-blue-700 text-xs text-left">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>Select a start and end date for rescheduling.</p>
            </div>
        </div>
    );
};
