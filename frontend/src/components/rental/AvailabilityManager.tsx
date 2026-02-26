import { useState, useEffect } from 'react';
import { rentalApi } from '../../services/api/rentalApi';
import type { IRentalItem, UnavailableDate } from '../../types/rental';
import { toast } from 'sonner';
import { Calendar, Ban, Trash2, Info } from 'lucide-react';

export function AvailabilityManager() {
    const [items, setItems] = useState<IRentalItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [blockedDates, setBlockedDates] = useState<UnavailableDate[]>([]);
    const [loading, setLoading] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        if (selectedItem) {
            fetchBlockedDates(selectedItem);
        } else {
            setBlockedDates([]);
        }
    }, [selectedItem]);

    const fetchItems = async () => {
        try {
            const response = await rentalApi.getUserItems(1, 100);
            if (response.data?.items) {
                setItems(response.data.items);
                if (response.data.items.length > 0) {
                    setSelectedItem(response.data.items[0]._id);
                }
            }
        } catch {
            toast.error("Failed to fetch your rental items");
        }
    };

    const fetchBlockedDates = async (itemId: string) => {
        setLoading(true);
        try {
            const dates = await rentalApi.getUnavailableDates(itemId);
            setBlockedDates(dates.filter(d => d.type === 'BLOCKED'));
        } catch {
            toast.error("Failed to fetch blocked dates");
        } finally {
            setLoading(false);
        }
    };

    const handleBlockDates = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !startDate || !endDate) return;

        setIsSubmitting(true);
        try {
            await rentalApi.blockDates(selectedItem, new Date(startDate), new Date(endDate), reason);
            toast.success("Dates blocked successfully");
            setStartDate('');
            setEndDate('');
            setReason('');
            fetchBlockedDates(selectedItem);
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to block dates";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnblock = async (date: UnavailableDate) => {
        if (!confirm("Are you sure you want to unblock these dates?")) return;
        try {
            await rentalApi.unblockDates(selectedItem, new Date(date.startDate), new Date(date.endDate));
            toast.success("Dates unblocked successfully");
            fetchBlockedDates(selectedItem);
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to unblock dates";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Availability Management
            </h2>

            <div>
                <label htmlFor="rental-item-select" className="block text-sm font-medium text-gray-700 mb-2">Select Rental Item</label>
                <select
                    id="rental-item-select"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                    {items.map(item => (
                        <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                    {items.length === 0 && <option disabled>No items found</option>}
                </select>
            </div>

            {selectedItem && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    <form onSubmit={handleBlockDates} className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Block New Dates</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start-date" className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                                <input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                                <input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="block-reason" className="block text-xs font-medium text-gray-500 mb-1">Reason (Optional)</label>
                            <input
                                id="block-reason"
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Maintenance, Personal Use"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !startDate || !endDate}
                            className="w-full py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Ban size={18} /> Block Dates
                        </button>
                    </form>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Currently Blocked</h3>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
                            </div>
                        ) : blockedDates.length > 0 ? (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {blockedDates.map((date, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-red-200 transition-colors">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {new Date(date.startDate).toLocaleDateString()} - {new Date(date.endDate).toLocaleDateString()}
                                            </div>
                                            {date.reason && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Info size={12} /> {date.reason}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleUnblock(date)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                            title="Unblock dates"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No dates blocked for this item.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
