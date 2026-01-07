import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Info, AlertCircle, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { availabilityApi } from '../../../services/api/availabilityApi';

const AvailabilityPage = () => {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);

    // Fetch availability for next 3 months
    const fetchAvailabilities = async () => {
        setIsLoading(true);
        try {
            const startStr = new Date().toISOString();
            const end = new Date();
            end.setMonth(end.getMonth() + 3);
            const endStr = end.toISOString();
            const data = await availabilityApi.getAvailability(startStr, endStr);
            setAvailabilities(data);
        } catch (error) {
            console.error("Failed to fetch availability", error);
            toast.error("Failed to load availability data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailabilities();
    }, []);

    const months = [];
    for (let i = 0; i < 3; i++) {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + i);
        months.push({
            name: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
            month: d.getMonth(),
            year: d.getFullYear(),
            daysCount: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
            startOffset: new Date(d.getFullYear(), d.getMonth(), 1).getDay()
        });
    }

    const getStatus = (day: number, month: number, year: number) => {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        const avail = availabilities.find(a => {
            const aDate = new Date(a.date);
            aDate.setHours(0, 0, 0, 0);
            return aDate.getTime() === date.getTime();
        });

        if (!avail) return 'AVAILABLE';

        // Check slots for BOOKED status
        const hasBooking = avail.slots.some((s: any) => s.status === 'BOOKED');
        if (hasBooking) return 'BOOKED';

        if (!avail.isFullDayAvailable) return 'BLOCKED';

        return 'AVAILABLE';
    };

    const getStatusClass = (day: number, month: number, year: number) => {
        const status = getStatus(day, month, year);
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (date < now) return 'text-gray-300 cursor-not-allowed';

        switch (status) {
            case 'BOOKED': return 'bg-emerald-900 text-white shadow-sm';
            case 'BLOCKED': return 'bg-red-600 text-white shadow-sm';
            default: return 'hover:bg-green-50 text-gray-700 bg-white border border-gray-100';
        }
    };

    const handleBlockRange = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            toast.error("Start date must be before end date");
            return;
        }

        setIsBlocking(true);
        try {
            await availabilityApi.blockRange(startDate, endDate);
            toast.success("Dates blocked successfully");
            fetchAvailabilities();
            setStartDate('');
            setEndDate('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to block dates");
        } finally {
            setIsBlocking(false);
        }
    };

    // --- Modal State ---
    const [selectedDateInfo, setSelectedDateInfo] = useState<{ date: Date, status: string, availability?: any } | null>(null);

    const handleDateClick = (day: number, month: number, year: number) => {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (date < now) return;

        const status = getStatus(day, month, year);
        const avail = availabilities.find(a => {
            const aDate = new Date(a.date);
            aDate.setHours(0, 0, 0, 0);
            return aDate.getTime() === date.getTime();
        });

        setSelectedDateInfo({ date, status, availability: avail });
    };

    const handleUpdateStatus = async (newStatus: 'AVAILABLE' | 'BLOCKED') => {
        if (!selectedDateInfo) return;

        const toastId = toast.loading("Updating availability...");
        try {
            await availabilityApi.setAvailability({
                date: selectedDateInfo.date.toISOString(),
                slots: [],
                isFullDayAvailable: newStatus === 'AVAILABLE'
            });
            toast.success("Availability updated", { id: toastId });
            fetchAvailabilities();
            setSelectedDateInfo(null); // Close modal
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update availability", { id: toastId });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gray-50/50 p-6 md:p-10"
        >
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <CalendarIcon className="text-green-700" size={32} />
                            Booking Availability
                        </h1>
                        <p className="text-gray-500 mt-2">Manage your calendar by blocking days or specific time ranges.</p>
                    </div>
                    <button
                        onClick={() => router.history.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm mb-4 md:mb-0 md:order-first"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const d = new Date(currentDate);
                                d.setMonth(d.getMonth() - 1);
                                setCurrentDate(d);
                            }}
                            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => {
                                const d = new Date(currentDate);
                                d.setMonth(d.getMonth() + 1);
                                setCurrentDate(d);
                            }}
                            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Calendar View */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-800">Calendar Overview</h2>
                                <div className="flex gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full border border-green-200 bg-white"></div>
                                        <span>Available</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-emerald-900"></div>
                                        <span>Booked</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                                        <span>Blocked</span>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentDate.getTime()}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-10"
                                >
                                    {months.map((m, idx) => (
                                        <div key={m.name} className={`space-y-4 ${idx > 1 ? 'hidden md:block' : ''}`}>
                                            <h3 className="font-bold text-gray-700 text-lg border-b border-gray-50 pb-2">{m.name}</h3>
                                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold text-green-700 opacity-60 mb-2">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                                            </div>
                                            <div className="grid grid-cols-7 gap-2">
                                                {Array.from({ length: m.startOffset }).map((_, i) => <div key={`offset-${i}`} />)}
                                                {Array.from({ length: m.daysCount }).map((_, i) => (
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        key={`${m.name}-${i}`}
                                                        onClick={() => handleDateClick(i + 1, m.month, m.year)}
                                                        className={`h-10 w-full flex items-center justify-center text-xs font-semibold rounded-lg cursor-pointer transition-all duration-300 ${getStatusClass(i + 1, m.month, m.year)}`}
                                                    >
                                                        {i + 1}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Block Range Card */}
                        <div className="bg-[#1B3C2D] rounded-2xl p-6 text-white shadow-xl shadow-green-900/10">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="text-green-400" size={24} />
                                <h3 className="text-lg font-bold">Block Date Range</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-green-400 tracking-wider mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-green-400 tracking-wider mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    onClick={handleBlockRange}
                                    disabled={isBlocking}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-red-950/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                                >
                                    {isBlocking ? <Loader2 className="animate-spin" size={18} /> : "Block Selected Dates"}
                                </button>
                            </div>
                        </div>

                        {/* Settings Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Info className="text-green-700" size={20} />
                                Buffer Settings
                            </h3>
                            <div className="space-y-6">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Notice Interval</label>
                                    <select className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none">
                                        <option>12 hours</option>
                                        <option>24 hours (Default)</option>
                                        <option>48 hours</option>
                                        <option>72 hours</option>
                                        <option>1 Week</option>
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-2">Minimum time required for new bookings.</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Post-Session Buffer</label>
                                    <select className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none">
                                        <option>None</option>
                                        <option>30 minutes</option>
                                        <option>1 hour</option>
                                        <option>1.5 hours</option>
                                        <option>2 hours</option>
                                        <option>3 hours</option>
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-2">Buffer time between back-to-back sessions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal for Date Action */}
                {selectedDateInfo && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDateInfo(null)}>
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-serif text-gray-900 mb-2">
                                    {selectedDateInfo.date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </h3>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${selectedDateInfo.status === 'BOOKED' ? 'bg-emerald-100 text-emerald-800' :
                                        selectedDateInfo.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                                            'bg-green-100 text-green-800'}`}>
                                    {selectedDateInfo.status === 'BOOKED' && <AlertCircle size={12} />}
                                    {selectedDateInfo.status}
                                </div>
                            </div>

                            {selectedDateInfo.status === 'BOOKED' ? (
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600 mb-2">This date is booked.</p>
                                    <p className="text-xs text-gray-400">To manage this booking, please visit your Bookings Dashboard.</p>
                                    <button
                                        onClick={() => router.navigate({ to: '/photographer/bookings' } as any)}
                                        className="mt-4 text-green-700 text-sm font-bold hover:underline"
                                    >
                                        Go to Bookings
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedDateInfo.status === 'BLOCKED' ? (
                                        <>
                                            <p className="text-sm text-gray-500 text-center mb-4">This date is currently blocked. Clients cannot book you on this day.</p>
                                            <button
                                                onClick={() => handleUpdateStatus('AVAILABLE')}
                                                className="w-full py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors"
                                            >
                                                Mark as Available
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-500 text-center mb-4">This date is available for bookings.</p>
                                            <button
                                                onClick={() => handleUpdateStatus('BLOCKED')}
                                                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                                            >
                                                Block Date
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedDateInfo(null)}
                                className="w-full mt-4 py-2 text-gray-400 text-sm font-medium hover:text-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}


                {/* Legend/Info footer */}
                <footer className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-3 text-orange-800">
                        <AlertCircle size={24} />
                        <p className="text-sm font-medium">To modify your availability, simply click on an available day to block it, or a blocked day to make it available again.</p>
                    </div>
                    <div className="md:ml-auto">
                        <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full">Manual Block Enabled</span>
                        </div>
                    </div>
                </footer>
            </div>
        </motion.div>
    );
};

export default AvailabilityPage;
