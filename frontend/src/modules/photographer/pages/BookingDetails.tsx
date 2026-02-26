import React from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../../../services/api/bookingApi';
import { useBookingActions } from '../hooks/usePhotographerDashboard';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Mail,
    ChevronLeft,
    CreditCard,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { ROUTES } from '../../../constants/routes';

interface BookingDetailsPageProps {
    bookingId: string;
}

const BookingDetailsPage = ({ bookingId }: BookingDetailsPageProps) => {
    const navigate = useNavigate();
    const search: { source?: string } = useSearch({ strict: false });
    const { acceptBooking, rejectBooking, startWork, endWork, deliverWork, respondToReschedule } = useBookingActions();

    const [actionConfig, setActionConfig] = React.useState<{ isOpen: boolean; type: 'accept' | 'reject' | 'deliver' | null, bookingId: string | null }>({
        isOpen: false,
        type: null,
        bookingId: null
    });
    const [customMessage, setCustomMessage] = React.useState('');

    const { data: booking, isLoading, error } = useQuery({
        queryKey: ['booking', bookingId],
        queryFn: () => bookingApi.getBookingDetails(bookingId),
        enabled: !!bookingId && bookingId !== 'undefined',
        refetchInterval: 5000
    });

    const handleBack = () => {
        if (search.source === 'dashboard') {
            navigate({ to: ROUTES.PHOTOGRAPHER.DASHBOARD });
        } else {
            navigate({ to: ROUTES.PHOTOGRAPHER.BOOKINGS });
        }
    };

    const openActionModal = (type: 'accept' | 'reject' | 'deliver', id: string) => {
        setActionConfig({ isOpen: true, type, bookingId: id });
        setCustomMessage('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load booking details</p>
                    <button
                        onClick={() => window.history.back()}
                        className="text-green-700 hover:underline"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        accepted: 'bg-blue-100 text-blue-800 border-blue-200',
        waiting_for_deposit: 'bg-orange-100 text-orange-800 border-orange-200',
        deposit_paid: 'bg-green-100 text-green-800 border-green-200',
        work_started: 'bg-purple-100 text-purple-800 border-purple-200',
        work_ended_pending: 'bg-amber-100 text-amber-800 border-amber-200',
        work_ended: 'bg-teal-100 text-teal-800 border-teal-200',
        work_delivered: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        completed: 'bg-green-100 text-green-800 border-green-200'
    };

    const handleConfirmAction = () => {
        if (!actionConfig.bookingId || !actionConfig.type) return;

        const actionPayload = { id: actionConfig.bookingId, message: customMessage };

        if (actionConfig.type === 'accept') {
            acceptBooking.mutate(actionPayload, {
                onSuccess: () => setActionConfig({ isOpen: false, type: null, bookingId: null })
            });
        } else if (actionConfig.type === 'deliver') {
            deliverWork.mutate({ id: actionConfig.bookingId, deliveryLink: customMessage }, {
                onSuccess: () => setActionConfig({ isOpen: false, type: null, bookingId: null })
            });
        } else {
            rejectBooking.mutate(actionPayload, {
                onSuccess: () => setActionConfig({ isOpen: false, type: null, bookingId: null })
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={handleBack}
                    className="flex items-center text-sm text-gray-500 hover:text-green-700 transition-colors mb-6"
                >
                    <ChevronLeft size={16} className="mr-1" />
                    {search.source === 'dashboard' ? 'Back to Dashboard' : 'Back to Bookings'}
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border", statusColors[booking.status] || 'bg-gray-100 text-gray-500')}>
                                    {booking.status === 'waiting_for_deposit' ? 'Awaiting Payment' : booking.status}
                                </span>
                            </div>
                            <p className="text-gray-500">Booking ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{booking._id}</span></p>
                            {booking.photographerMessage && (
                                <p className="text-xs text-green-700 mt-2 italic border-l-2 border-green-500 pl-2">
                                    "{booking.photographerMessage}"
                                </p>
                            )}

                            {booking.rescheduleRequest?.requestedDate && booking.rescheduleRequest.status === 'pending' && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-yellow-800 mb-2">
                                        <Clock size={16} /> Reschedule Requested
                                    </h4>
                                    <div className="text-sm space-y-1 mb-3">
                                        <p><span className="text-gray-600">New Date:</span> <strong>{new Date(booking.rescheduleRequest.requestedDate).toLocaleDateString()}</strong></p>
                                        <p><span className="text-gray-600">New Time:</span> <strong>{booking.rescheduleRequest.requestedStartTime}</strong></p>
                                        <p><span className="text-gray-600">Reason:</span> <span className="italic">"{booking.rescheduleRequest.reason}"</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => respondToReschedule.mutate({ id: booking._id, decision: 'accepted' })}
                                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-green-700"
                                            disabled={respondToReschedule.isPending}
                                        >
                                            <CheckCircle size={12} /> Accept
                                        </button>
                                        <button
                                            onClick={() => respondToReschedule.mutate({ id: booking._id, decision: 'rejected' })}
                                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded flex items-center gap-1 hover:bg-red-50"
                                            disabled={respondToReschedule.isPending}
                                        >
                                            <XCircle size={12} /> Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {booking.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => openActionModal('reject', booking._id)}
                                        disabled={rejectBooking.isPending || acceptBooking.isPending}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 disabled:opacity-50 transition-all"
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => openActionModal('accept', booking._id)}
                                        disabled={acceptBooking.isPending || rejectBooking.isPending}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#2E7D46] text-white rounded-xl font-bold hover:bg-green-800 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                                    >
                                        <CheckCircle size={18} />
                                        Accept Request
                                    </button>
                                </>
                            )}
                            {(booking.status === 'accepted' || booking.status === 'waiting_for_deposit') && (
                                <button
                                    onClick={() => openActionModal('reject', booking._id)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel Booking
                                </button>
                            )}
                            {(booking.status === 'deposit_paid' || (booking.paymentStatus === 'deposit_paid' && booking.status === 'accepted')) && (
                                <button
                                    onClick={() => startWork.mutate({ id: booking._id })}
                                    disabled={startWork.isPending}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#2E7D46] text-white rounded-xl font-bold hover:bg-green-800 shadow-md disabled:opacity-50 transition-all"
                                >
                                    <CheckCircle size={18} />
                                    Start Work
                                </button>
                            )}
                            {booking.status === 'work_started' && (
                                <button
                                    onClick={() => endWork.mutate({ id: booking._id })}
                                    disabled={endWork.isPending}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md disabled:opacity-50 transition-all"
                                >
                                    <CheckCircle size={18} />
                                    End Work
                                </button>
                            )}
                            {booking.status === 'work_ended' && booking.paymentStatus === 'full_paid' && (
                                <button
                                    onClick={() => openActionModal('deliver', booking._id)}
                                    disabled={deliverWork.isPending}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-md disabled:opacity-50 transition-all"
                                >
                                    <CheckCircle size={18} />
                                    Deliver Work
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Calendar className="text-green-600" size={20} />
                                Session Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</label>
                                    <p className="text-gray-900 font-medium">{format(new Date(booking.eventDate), 'EEEE, MMMM do, yyyy')}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Time</label>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Clock size={16} className="text-gray-400" />
                                        {booking.startTime}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</label>
                                    <div className="flex items-start gap-2 text-gray-900 font-medium">
                                        <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
                                        {booking.location}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Event Type</label>
                                    <p className="text-gray-900 font-medium">{booking.eventType}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="text-green-600" size={20} />
                                Package & Payment
                            </h2>

                            <div className="bg-green-50 rounded-xl p-6 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-green-900">{booking.packageId?.name || "Custom Package"}</h3>
                                    <span className="text-xl font-bold text-green-700">${booking.totalAmount}</span>
                                </div>
                                <p className="text-sm text-green-700 opacity-80">Full Session Package</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Package Price</span>
                                    <span className="font-medium text-gray-900">${booking.totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Deposit Required</span>
                                    <span className="font-medium text-gray-900">${booking.depositeRequired}</span>
                                </div>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <div className="flex justify-between text-base font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-green-700">${booking.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User className="text-green-600" size={20} />
                                Client Info
                            </h2>

                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-gray-100 mb-3 overflow-hidden">
                                    {booking.userId?.profileImage ? (
                                        <img src={booking.userId.profileImage} alt={booking.userId.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{booking.userId?.name}</h3>
                                <p className="text-sm text-gray-500">Client</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail size={18} className="text-gray-400" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 font-medium">Email</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{booking.userId?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <button className="w-full py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors">
                                    Send Message
                                </button>
                            </div>
                        </div>

                        {booking.status === 'pending' && (
                            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-bold mb-1">Action Required</p>
                                        <p>Please accept or reject this request. Acceptance will trigger a deposit request to the client.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {booking.status === 'waiting_for_deposit' && (
                            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                                <div className="flex items-start gap-3">
                                    <Clock className="text-blue-500 shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-bold mb-1">Awaiting Deposit</p>
                                        <p>Client has been notified. The timer will expire in ~2 hours.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {actionConfig.isOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                                {actionConfig.type === 'accept' ? 'Accept Request' :
                                    actionConfig.type === 'reject' ? 'Reject Booking' :
                                        actionConfig.type === 'deliver' ? 'Deliver Work' : ''}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {actionConfig.type === 'accept'
                                    ? 'You are about to accept this booking. You can add a personal note to the client.'
                                    : actionConfig.type === 'reject'
                                        ? 'Are you sure you want to reject/cancel this booking? Please provide a reason.'
                                        : 'Please provide the Google Drive (or other) link to the completed photos/videos.'}
                            </p>

                            {actionConfig.type === 'deliver' ? (
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    autoFocus
                                />
                            ) : (
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder={actionConfig.type === 'accept' ? "Optional welcome message..." : "Reason for rejection..."}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                                    autoFocus
                                />
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setActionConfig({ isOpen: false, type: null, bookingId: null })}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm
                                        ${actionConfig.type === 'accept' || actionConfig.type === 'deliver' ? 'bg-[#2E7D46] hover:bg-green-800' : 'bg-red-600 hover:bg-red-700'}
                                    `}
                                >
                                    Confirm {actionConfig.type === 'accept' ? 'Accept' : actionConfig.type === 'reject' ? 'Reject' : 'Delivery'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BookingDetailsPage;
