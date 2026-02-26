import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react';
import { userPhotographerApi } from '../../services/api/userPhotographerApi';

interface PhotographerAvailabilityCalendarProps {
    photographerId: string;
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    className?: string;
    excludeDate?: Date;
}

interface AvailabilitySlot {
    date: string;
    isFullDayAvailable: boolean;
    slots: { startTime: string; endTime: string; isAvailable: boolean }[];
}

export const PhotographerAvailabilityCalendar: React.FC<PhotographerAvailabilityCalendarProps> = ({
    photographerId,
    selectedDate,
    onSelectDate,
    className = "",
    excludeDate
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (photographerId) {
            fetchAvailability();
        }
    }, [currentDate.getMonth(), currentDate.getFullYear(), photographerId]);

    const fetchAvailability = async () => {
        setIsLoading(true);
        try {
            const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const data = await userPhotographerApi.getAvailability(
                photographerId,
                start.toISOString(),
                end.toISOString()
            );
            setAvailability(data);
        } catch (error) {
            console.error("Failed to fetch availability", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const getDateStatus = (day: number) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = checkDate.toISOString().split('T')[0];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkDate < today) return 'unavailable';

        if (excludeDate && excludeDate.toDateString() === checkDate.toDateString()) return 'current';

        const entry = availability.find(a => a.date.startsWith(dateStr));

        if (selectedDate && selectedDate.toDateString() === checkDate.toDateString()) return 'selected';

        if (!entry) return 'unavailable';
        if (!entry.isFullDayAvailable) return 'unavailable';
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

                    if (status === 'unavailable') bgClass = "bg-gray-50 text-gray-300 cursor-not-allowed";
                    if (status === 'current') bgClass = "bg-blue-50 text-blue-600 border-blue-200 cursor-not-allowed font-semibold";
                    if (status === 'available') bgClass = "bg-white border-green-100 hover:border-green-500 hover:shadow-sm cursor-pointer";
                    if (status === 'selected') bgClass = "bg-green-600 text-white font-bold border-green-600 shadow-md transform scale-105";

                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={status === 'unavailable' || status === 'current'}
                            onClick={() => onSelectDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
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
                    <div className="w-3 h-3 rounded border border-green-500 bg-white"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
                    <span>Blocked</span>
                </div>
                {excludeDate && (
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></div>
                        <span>Current Date</span>
                    </div>
                )}
            </div>

            <div className="mt-3 bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-blue-700 text-xs text-left">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>Date availability is updated in real-time.</p>
            </div>
        </div>
    );
};
