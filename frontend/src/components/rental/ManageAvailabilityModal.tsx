import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalApi } from '../../services/api/rentalApi';
import { AvailabilityCalendar } from '../common/AvailabilityCalendar';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ManageAvailabilityModalProps {
    itemId: string;
    onClose: () => void;
}

export const ManageAvailabilityModal: React.FC<ManageAvailabilityModalProps> = ({ itemId, onClose }) => {
    const queryClient = useQueryClient();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [reason, setReason] = useState("");

    const { data: unavailableDates = [] } = useQuery({
        queryKey: ['rental-unavailable', itemId],
        queryFn: () => rentalApi.getUnavailableDates(itemId),
        enabled: !!itemId
    });

    const blockMutation = useMutation({
        mutationFn: () => rentalApi.blockDates(itemId, startDate!, endDate!, reason || "Unavailable"),
        onSuccess: () => {
            toast.success("Dates blocked successfully");
            setStartDate(null);
            setEndDate(null);
            setReason("");
            queryClient.invalidateQueries({ queryKey: ['rental-unavailable', itemId] });
        },

        onError: (err: unknown) => {
            const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to block dates";
            toast.error(errorMessage);
        }
    });

    const unblockMutation = useMutation({
        mutationFn: () => rentalApi.unblockDates(itemId, startDate!, endDate!),
        onSuccess: () => {
            toast.success("Dates unblocked successfully");
            setStartDate(null);
            setEndDate(null);
            queryClient.invalidateQueries({ queryKey: ['rental-unavailable', itemId] });
        },

        onError: (err: unknown) => {
            const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to unblock dates";
            toast.error(errorMessage);
        }
    });

    const handleDateSelect = (start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
    };

    const isSelectedRangeBlocked = React.useMemo(() => {
        if (!startDate || !endDate) return false;

        return unavailableDates.some((d: { startDate: string | Date; endDate: string | Date; type: string }) => {
            if (d.type !== 'BLOCKED') return false;

            const bStart = new Date(d.startDate);
            bStart.setHours(0, 0, 0, 0);

            const bEnd = new Date(d.endDate);
            bEnd.setHours(23, 59, 59, 999);

            const sStart = new Date(startDate);
            sStart.setHours(0, 0, 0, 0);

            const sEnd = new Date(endDate);
            sEnd.setHours(0, 0, 0, 0);

            return (sStart.getTime() <= bEnd.getTime() && sEnd.getTime() >= bStart.getTime());
        });
    }, [startDate, endDate, unavailableDates]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="text-green-600" size={20} />
                                Manage Availability
                            </h2>
                            <p className="text-sm text-gray-500">Block dates for maintenance or personal use</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <AvailabilityCalendar
                                unavailableDates={unavailableDates}
                                onDateSelect={handleDateSelect}
                                range={{ startDate, endDate }}
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="availability-reason" className="text-sm font-medium text-gray-700 block mb-1.5">Reason (Optional)</label>
                                <input
                                    id="availability-reason"
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g., Shop Closed, Personal Use, Maintenance"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <div className="text-sm text-gray-500 text-center mb-2">
                                    Select an action for the selected range:
                                </div>

                                <button
                                    onClick={() => blockMutation.mutate()}
                                    disabled={!startDate || !endDate || isSelectedRangeBlocked || blockMutation.isPending}
                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                    ${!startDate || !endDate || isSelectedRangeBlocked || blockMutation.isPending
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}
                                >
                                    <AlertCircle size={16} /> Block Selected Dates
                                </button>

                                <button
                                    onClick={() => unblockMutation.mutate()}
                                    disabled={!startDate || !endDate || !isSelectedRangeBlocked || unblockMutation.isPending}
                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                    ${!startDate || !endDate || !isSelectedRangeBlocked || unblockMutation.isPending
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-700 text-white hover:bg-green-800 shadow-md'}`}
                                >
                                    <Calendar size={16} /> Make Available
                                </button>

                                <button
                                    onClick={() => unblockMutation.mutate()}
                                    disabled={!startDate || !endDate || !isSelectedRangeBlocked || unblockMutation.isPending}
                                    className={`w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2`}
                                >
                                    <X size={16} /> Set as Not Assigned
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
