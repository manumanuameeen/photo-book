import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { usePhotographerBookings } from '../hooks/usePhotographerBookings';
import { useBookingActions } from '../hooks/usePhotographerDashboard';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { Link, useNavigate } from '@tanstack/react-router';

import { ROUTES } from '../../../constants/routes';

const Bookings = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const { data, isLoading } = usePhotographerBookings(statusFilter, page);
    const navigate = useNavigate();

    const handleCardClick = (bookingId: string) => {
        if (!bookingId || bookingId === 'undefined') return;
        navigate({
            to: ROUTES.PHOTOGRAPHER.BOOKING_DETAILS,
            params: { id: bookingId },
            search: { source: 'bookings' }
        });
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-blue-100 text-blue-800',
        waiting_for_deposit: 'bg-orange-100 text-orange-800',
        rejected: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800',
        completed: 'bg-green-100 text-green-800'
    };

    const tabs = [
        { id: 'all', label: 'All Requests' },
        { id: 'pending', label: 'Pending' },
        { id: 'accepted', label: 'Upcoming' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' }
    ];

    const { acceptBooking, rejectBooking } = useBookingActions();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
                        <p className="text-sm text-gray-500">Manage your client bookings and schedule.</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                                className={clsx(
                                    "px-4 py-2 text-xs font-bold rounded-md whitespace-nowrap transition-colors",
                                    statusFilter === tab.id ? "bg-[#2E7D46] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data?.bookings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                                <Filter size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
                                <p className="text-sm text-gray-500">Try adjusting your filters or wait for new requests.</p>
                            </div>
                        ) : (
                            data?.bookings.map((booking) => (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleCardClick(booking._id)}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                                        <div className="md:col-span-2 flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg text-center">
                                            <span className="text-xs font-bold text-gray-500 uppercase">{format(new Date(booking.eventDate), 'MMM')}</span>
                                            <span className="text-2xl font-bold text-gray-900">{format(new Date(booking.eventDate), 'dd')}</span>
                                            <span className="text-[10px] text-gray-400">{format(new Date(booking.eventDate), 'EEE')}</span>
                                        </div>

                                        <div className="md:col-span-5 space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", statusColors[booking.status || 'pending'])}>
                                                    {booking.status}
                                                </span>
                                                <span className="text-[10px] text-gray-400">• ID: {(booking._id || '').slice(-6)}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">{booking.packageName}</h3>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>{booking.eventType}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    <span>{booking.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-3 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {booking.clientImage ? (
                                                    <img src={booking.clientImage} alt={booking.clientName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={18} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{booking.clientName}</p>
                                                <p className="text-[10px] text-gray-500">{booking.clientEmail || 'No email provided'}</p>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-[#2E7D46]">${booking.packagePrice.toLocaleString()}</p>
                                                {booking.paymentStatus === 'deposit_paid' && (
                                                    <p className="text-[10px] text-red-500 font-medium">Pending: ${(booking.packagePrice - (booking.packagePrice * 0.2)).toLocaleString()}</p>
                                                )}
                                                <p className="text-[10px] text-gray-400 capitalize">{booking.paymentStatus.replace('_', ' ')}</p>
                                            </div>
                                            {booking._id && (
                                                <Link
                                                    to={ROUTES.PHOTOGRAPHER.BOOKING_DETAILS}
                                                    params={{ id: booking._id }}
                                                    search={{ source: 'bookings' }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs font-bold text-green-700 hover:text-green-800 underline"
                                                >
                                                    View Details
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 border-t border-gray-100">
                                        {booking._id ? (
                                            <Link
                                                to={ROUTES.PHOTOGRAPHER.BOOKING_DETAILS}
                                                params={{ id: booking._id }}
                                                search={{ source: 'bookings' }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-bold hover:bg-gray-50 flex items-center justify-center"
                                            >
                                                View Details
                                            </Link>
                                        ) : (
                                            <button disabled className="px-4 py-1.5 bg-gray-100 border border-gray-300 text-gray-400 rounded-md text-xs font-bold cursor-not-allowed flex items-center justify-center">
                                                View Details
                                            </button>
                                        )}

                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); rejectBooking.mutate({ id: booking._id, message: '' }); }}
                                                    disabled={rejectBooking.isPending || acceptBooking.isPending}
                                                    className="px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-xs font-bold hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    {rejectBooking.isPending ? 'Rejecting...' : 'Reject'}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); acceptBooking.mutate({ id: booking._id, message: '' }); }}
                                                    disabled={rejectBooking.isPending || acceptBooking.isPending}
                                                    className="px-4 py-1.5 bg-[#2E7D46] text-white rounded-md text-xs font-bold hover:bg-green-700 shadow-sm disabled:opacity-50"
                                                >
                                                    {acceptBooking.isPending ? 'Accepting...' : 'Accept'}
                                                </button>
                                            </>
                                        )}

                                        {booking.status === 'accepted' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); rejectBooking.mutate({ id: booking._id, message: 'Cancelled by photographer' }); }}
                                                disabled={rejectBooking.isPending}
                                                className="px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-xs font-bold hover:bg-red-50 disabled:opacity-50"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}

                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-gray-600">
                                Page {page} of {data?.pagination?.totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(data?.pagination?.totalPages || 1, p + 1))}
                                disabled={page === (data?.pagination?.totalPages || 1)}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Bookings;
