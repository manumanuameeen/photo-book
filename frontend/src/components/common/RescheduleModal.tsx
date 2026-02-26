import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlignLeft } from 'lucide-react';
import { PhotographerAvailabilityCalendar } from './PhotographerAvailabilityCalendar';
import { TimePicker } from './TimePicker';
import { RentalAvailabilityCalendar } from './RentalAvailabilityCalendar';
interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { date?: string; startTime?: string; startDate?: string; endDate?: string; reason: string }) => void;
    mode: 'booking' | 'rental';
    isLoading?: boolean;
    currentDate?: string;
    currentTime?: string;
    currentStartDate?: string;
    currentEndDate?: string;
    photographerId?: string;
    itemId?: string;
    pricePerDay?: number;
    orderTotalAmount?: number;
    amountPaid?: number;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    mode,
    isLoading = false,
    currentDate,
    currentTime,
    currentStartDate,
    currentEndDate,
    photographerId,
    itemId,
    pricePerDay,
    orderTotalAmount,
    amountPaid
}) => {

    const [date, setDate] = useState(currentDate ? new Date(currentDate).toISOString().split('T')[0] : '');
    const [time, setTime] = useState(currentTime || '');

    const [startDate, setStartDate] = useState(currentStartDate ? new Date(currentStartDate).toISOString().split('T')[0] : '');
    const [endDate, setEndDate] = useState(currentEndDate ? new Date(currentEndDate).toISOString().split('T')[0] : '');

    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault();

        if (mode === 'booking') {
            onConfirm({ date, startTime: time, reason });
        } else {
            onConfirm({ startDate, endDate, reason });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Reschedule" width="max-w-md">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
                    Submit a request to change the dates. The vendor will review and approve or reject your request.
                </div>

                <div className="space-y-4">
                    {mode === 'booking' ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Select New Date</label>
                                {photographerId ? (
                                    <PhotographerAvailabilityCalendar
                                        photographerId={photographerId}
                                        selectedDate={date ? new Date(date) : null}
                                        excludeDate={currentDate ? new Date(currentDate) : undefined}
                                        onSelectDate={(d) => {
                                            const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                            setDate(localDate);
                                        }}
                                    />
                                ) : (
                                    <p className="text-red-500 text-sm">Error: Photographer ID missing.</p>
                                )}
                            </div>
                            <div>
                                <TimePicker
                                    label="New Start Time"
                                    value={time}
                                    onChange={setTime}
                                />
                            </div>
                        </>
                    ) : (

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Select New Dates</label>
                            {itemId ? (
                                <RentalAvailabilityCalendar
                                    itemId={itemId}
                                    startDate={startDate ? new Date(startDate) : null}
                                    endDate={endDate ? new Date(endDate) : null}
                                    currentRentalStart={currentStartDate ? new Date(currentStartDate) : undefined}
                                    currentRentalEnd={currentEndDate ? new Date(currentEndDate) : undefined}
                                    onSelectRange={(start, end) => {
                                        const formatDate = (d: Date) => {
                                            const year = d.getFullYear();
                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                            const day = String(d.getDate()).padStart(2, '0');
                                            return `${year}-${month}-${day}`;
                                        };
                                        setStartDate(start ? formatDate(start) : '');
                                        setEndDate(end ? formatDate(end) : '');
                                    }}
                                />
                            ) : (
                                <p className="text-red-500 text-sm">Error: Item ID missing.</p>
                            )}
                            <div className="flex gap-4 text-sm">
                                <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Start Date</span>
                                    <span className="font-medium">{startDate || '-'}</span>
                                </div>
                                <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">End Date</span>
                                    <span className="font-medium">{endDate || '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === 'rental' && pricePerDay && orderTotalAmount !== undefined && startDate && endDate && (
                        (() => {
                            const start = new Date(startDate);
                            const end = new Date(endDate);
                            const diffTime = end.getTime() - start.getTime();
                            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                            if (days > 0) {
                                const newTotal = days * pricePerDay;
                                const diff = newTotal - orderTotalAmount;
                                const isRefund = diff < 0;
                                const isIncrease = diff > 0;
                                const isFullyPaid = (amountPaid || 0) >= orderTotalAmount;

                                return (
                                    <div className={`p-4 rounded-xl border text-sm space-y-2 ${isRefund ? 'bg-green-50 border-green-200 text-green-800' : isIncrease ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                        <div className="font-bold flex justify-between">
                                            <span>New Duration:</span>
                                            <span>{days} Days</span>
                                        </div>
                                        <div className="font-bold flex justify-between">
                                            <span>New Total Price:</span>
                                            <span>${newTotal.toFixed(2)}</span>
                                        </div>
                                        {diff !== 0 && (
                                            <div className="pt-2 border-t border-black/10 mt-2">
                                                <div className="flex justify-between font-bold">
                                                    <span>Difference:</span>
                                                    <span>{diff > 0 ? '+' : ''}${diff.toFixed(2)}</span>
                                                </div>
                                                <p className="text-xs mt-1 opacity-90">
                                                    {isRefund
                                                        ? "The difference will be refunded to your original payment method."
                                                        : isFullyPaid
                                                            ? "You will be required to pay the difference upon approval."
                                                            : "The remaining balance due will be adjusted accordingly."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })()
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Reason for Change</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Schedule conflict, bad weather..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px] resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-[#2E7D46] text-white rounded-lg font-bold hover:bg-green-700 shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form >
        </Modal >
    );
};
