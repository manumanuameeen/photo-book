import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    label?: string;
    error?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label = "Start Time", error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const timeSlots = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 30) {
            const hour = i;
            const minute = j;
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            const displayMinute = minute.toString().padStart(2, '0');

            const display = `${displayHour}:${displayMinute} ${period}`;
            
            const valueFormat = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

            timeSlots.push({ display, value: valueFormat });
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedDisplay = timeSlots.find(t => t.value === value)?.display || value || "";

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>}

            <div
                className={`relative w-full cursor-pointer group`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`
                    w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg flex items-center
                    ${error ? 'border-red-500' : 'border-gray-200 group-hover:border-green-400'}
                    ${isOpen ? 'ring-2 ring-green-500 border-green-500' : ''}
                    transition-all
                `}>
                    <Clock className="absolute left-3 text-gray-400" size={18} />
                    <span className={`text-sm ${selectedDisplay ? 'text-gray-900' : 'text-gray-400'}`}>
                        {selectedDisplay || "Select Time"}
                    </span>
                    <ChevronDown className={`absolute right-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
                </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1 grid grid-cols-1 gap-0.5">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot.value}
                                type="button"
                                onClick={() => {
                                    onChange(slot.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-between
                                    ${value === slot.value
                                        ? 'bg-green-50 text-green-700 font-bold'
                                        : 'text-gray-700 hover:bg-gray-50'}
                                `}
                            >
                                {slot.display}
                                {value === slot.value && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
