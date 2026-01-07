

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Info, Loader2 } from 'lucide-react';
import { userPhotographerApi } from '../../../services/api/userPhotographerApi';
import { toast } from 'sonner';


interface CheckAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    photographerId: string;
    photographerName: string;
    onBook: (date: Date) => void;
}

interface AvailabilitySlot {
    date: string;
    isFullDayAvailable: boolean;
    slots: any[];
}

export const CheckAvailabilityModal: React.FC<CheckAvailabilityModalProps> = ({
    isOpen,
    onClose,
    photographerId,
    photographerName,
    onBook
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && photographerId) {
            fetchAvailability();
        }
    }, [isOpen, currentDate, photographerId]);

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
            toast.error("Could not load availability.");
        } finally {
            setIsLoading(false);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDateStatus = (day: number) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = checkDate.toISOString().split('T')[0];

        const entry = availability.find(a => a.date.startsWith(dateStr));

        if (selectedDate && selectedDate.toDateString() === checkDate.toDateString()) return 'selected';
        if (!entry) return 'unavailable'; // Default
        if (!entry.isFullDayAvailable) return 'unavailable';
        return 'available';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Left Side: Calendar */}
                <div className="p-6 md:p-8 flex-1 border-r border-gray-100 overflow-y-auto">
                    <button onClick={onClose} className="md:hidden mb-4 text-gray-500"><X /></button>

                    <div className="flex justify-between items-center mb-6">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            {isLoading && <Loader2 size={16} className="animate-spin text-green-600" />}
                        </h2>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronRight size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const status = getDateStatus(day);
                            let bgClass = "bg-white hover:bg-gray-50 border-gray-100 text-gray-700";

                            if (status === 'unavailable') bgClass = "bg-gray-100 text-gray-400 cursor-not-allowed";
                            if (status === 'available') bgClass = "bg-white border-green-100 hover:border-green-500 hover:shadow-md cursor-pointer";
                            if (status === 'selected') bgClass = "bg-green-600 text-white shadow-lg shadow-green-200 transform scale-105 font-bold border-green-600";

                            return (
                                <button
                                    key={day}
                                    disabled={status === 'unavailable'}
                                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                    className={`
                                        aspect-square rounded-xl border flex items-center justify-center text-sm transition-all duration-200
                                        ${bgClass}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-blue-700 text-sm">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        <p>Availability is updated in real-time. If a date is blocked, please select another day.</p>
                    </div>
                </div>

                {/* Right Side: details */}
                <div className="w-full md:w-80 bg-white p-6 md:p-8 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Check Availability</h3>
                            <p className="text-sm text-gray-500">{photographerName}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h4 className="font-bold text-sm text-gray-900 mb-3">Availability Key</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-4 h-4 rounded bg-green-600"></div>
                                    <span>Your Selected Date(s)</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-4 h-4 rounded bg-gray-200"></div>
                                    <span>Unavailable / Fully Booked</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-4 h-4 rounded border border-green-500"></div>
                                    <span>Fully Available</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm text-gray-900 mb-3">Your Session Dates</h4>
                            {selectedDate ? (
                                <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                                    <p className="font-bold text-green-900">
                                        {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 italic">No date selected</div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <button
                            disabled={!selectedDate}
                            onClick={() => selectedDate && onBook(selectedDate)}
                            className="w-full bg-green-700 text-white font-bold py-3.5 rounded-xl hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-100 active:scale-95"
                        >
                            Continue to Booking
                        </button>

                        <button className="w-full text-xs text-green-700 underline hover:text-green-800 text-center">
                            Need a custom time? Contact Photographer
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
