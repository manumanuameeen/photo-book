import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Eye, ChevronLeft, ChevronRight, Search, RefreshCw, User, Clock } from "lucide-react";
import type { BookingDetails } from "../../../../services/api/bookingApi";
import { BookingDetailsModal } from "./BookingDetailsModal";

interface UserBookingsTabProps {
    bookings: BookingDetails[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPayDeposit: (booking: BookingDetails) => void;
    onBrowse: () => void;
    search: string;
    onSearchChange: (value: string) => void;
    filter: string;
    onFilterChange: (value: string) => void;
    onRefresh: () => void;
    onConfirmEndWork: (id: string) => void;
    onConfirmDelivery: (id: string) => void;
    onCancel: (id: string, reason: string) => void;
    isCancelling: boolean;
}

export const UserBookingsTab = ({ bookings, isLoading, page, totalPages, onPageChange, onPayDeposit, onConfirmEndWork, onConfirmDelivery, onBrowse, search, onSearchChange, filter, onFilterChange, onRefresh, onCancel, isCancelling }: UserBookingsTabProps) => {
    const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleViewDetails = (booking: BookingDetails) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            waiting_for_deposit: 'bg-purple-100 text-purple-800',
            accepted: 'bg-blue-100 text-blue-800',
            deposit_paid: 'bg-green-100 text-green-800',
            work_started: 'bg-purple-100 text-purple-800',
            work_ended_pending: 'bg-amber-100 text-amber-800',
            work_ended: 'bg-teal-100 text-teal-800',
            work_delivered: 'bg-indigo-100 text-indigo-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (!isLoading && bookings.length === 0 && !search && !filter) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No bookings yet</h3>
                <button onClick={onBrowse} className="mt-4 px-6 py-2 bg-[#2E7D46] text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">
                    Browse Photographers
                </button>
            </div>
        );
    }

    return (
        <motion.div key="bookings" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by photographer..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                    />
                </div>
                <button
                    onClick={onRefresh}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[#2E7D46] transition-colors"
                    title="Refresh List"
                >
                    <RefreshCw size={20} />
                </button>
                <select
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="waiting_for_deposit">Waiting for Deposit</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="space-y-4">
                {isLoading && (
                    <div className="py-20 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                )}

                {!isLoading && bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700">No bookings found</h3>
                        <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or browse for photographers.</p>
                        <button onClick={onBrowse} className="px-6 py-2 bg-[#2E7D46] text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">
                            Browse Photographers
                        </button>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div
                            key={booking._id}
                            onClick={() => handleViewDetails(booking)}
                            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group hover:border-[#2E7D46]/30"
                        >
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                
                                <div className="flex-shrink-0 w-full md:w-auto flex md:flex-col items-center justify-center gap-2 md:gap-0 p-3 bg-gray-50 rounded-lg border border-gray-100 min-w-[4rem]">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span className="text-xl font-bold text-gray-900">{new Date(booking.eventDate).getDate()}</span>
                                    <span className="text-[10px] font-medium text-gray-400">{new Date(booking.eventDate).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                </div>

                                <div className="flex-1 w-full min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-transparent ${getStatusColor(booking.status)}`}>
                                                {booking.status === 'waiting_for_deposit' ? 'Deposit Pending' : booking.status?.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-mono">#{booking._id.slice(-6).toUpperCase()}</span>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-[#2E7D46] transition-colors">{booking.packageId?.name || 'Unknown Package'}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                        {booking.photographerId?.profileImage ? (
                                                            <img src={booking.photographerId.profileImage} alt={booking.photographerId.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={10} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium truncate max-w-[150px]">
                                                        {booking.photographerId ? booking.photographerId.name : <span className="text-red-500 text-xs">Deleted Account</span>}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1 border-l border-gray-200 pl-4">
                                                    <Clock size={12} /> {booking.eventType}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end gap-3 lg:border-l border-gray-100 lg:pl-4">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Total Amount</div>
                                            <div className="text-lg font-bold text-gray-900 flex items-center justify-end gap-0.5">
                                                <span className="text-xs text-gray-400 font-normal">$</span>
                                                {booking.totalAmount?.toLocaleString()}
                                            </div>
                                            {booking.packageId?.price && booking.packageId.price !== booking.totalAmount && (
                                                <div className="text-[10px] text-gray-400">Pkg: ${booking.packageId.price}</div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {booking.status === 'waiting_for_deposit' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onPayDeposit(booking); }}
                                                    className="text-xs bg-[#2E7D46] text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold shadow-sm transition-colors"
                                                >
                                                    Pay Deposit
                                                </button>
                                            )}
                                            {booking.status === 'work_ended_pending' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onConfirmEndWork(booking._id); }}
                                                    className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-colors"
                                                >
                                                    Confirm Work Done
                                                </button>
                                            )}
                                            {booking.status === 'work_delivered' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onConfirmDelivery(booking._id); }}
                                                    className="text-xs bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-bold shadow-sm transition-colors"
                                                >
                                                    Confirm Delivery
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleViewDetails(booking); }}
                                                className="p-2 text-gray-400 hover:text-[#2E7D46] hover:bg-green-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-center mt-8 gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 bg-white border rounded-lg flex items-center text-gray-600 font-medium">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <BookingDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                booking={selectedBooking ? (bookings.find(b => b._id === selectedBooking._id) || selectedBooking) : null}
                onPayDeposit={onPayDeposit}
                onConfirmEndWork={onConfirmEndWork}
                onPayBalance={onPayDeposit}
                onConfirmDelivery={onConfirmDelivery}
                onCancel={onCancel}
                isCancelling={isCancelling}
            />
        </motion.div>
    );
};
