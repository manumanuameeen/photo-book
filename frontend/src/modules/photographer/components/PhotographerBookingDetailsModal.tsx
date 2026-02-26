import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Calendar, User, DollarSign, Phone, Mail, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { BookingDetails } from '../../../services/api/bookingApi';
import { ReportModal } from '../../../components/common/ReportModal';
import { useState } from 'react';

interface PhotographerBookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;

    booking: BookingDetails | null;
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    onStartWork?: (id: string) => void;
    onEndWork?: (id: string) => void;
    onDeliverWork?: (id: string) => void;
    onRespondToReschedule?: (id: string, decision: 'accepted' | 'rejected') => void;
}

export const PhotographerBookingDetailsModal: React.FC<PhotographerBookingDetailsModalProps> = ({
    isOpen, onClose, booking, onAccept, onReject, onStartWork, onEndWork, onDeliverWork, onRespondToReschedule
}) => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    if (!booking) return null;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            ACCEPTED: 'bg-green-100 text-green-800',
            WAITING_FOR_DEPOSIT: 'bg-orange-100 text-orange-800',
            REJECTED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            COMPLETED: 'bg-blue-100 text-blue-800',
            CONFIRMED: 'bg-green-100 text-green-800',
            ONGOING: 'bg-purple-100 text-purple-800',
            WORK_STARTED: 'bg-blue-100 text-blue-800',
            WORK_ENDED_PENDING: 'bg-indigo-100 text-indigo-800',
            WORK_ENDED: 'bg-purple-100 text-purple-800',
            WORK_DELIVERED: 'bg-teal-100 text-teal-800'
        };
        return colors[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
    };

    const clientName = booking.userId?.name || booking.clientName || 'Unknown Client';
    const clientEmail = booking.userId?.email || booking.clientEmail || '';
    const clientPhone = booking.userId?.phoneNumber || booking.clientPhone || 'No phone provided';
    const targetUserId = booking.userId?._id || (typeof booking.userId === 'string' ? booking.userId : null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Booking Request Details" width="max-w-xl">
            <div className="p-6 space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <div className="text-xs text-gray-500 font-mono mb-1">ID: #{booking._id?.slice(-6).toUpperCase()}</div>
                        <div className="flex items-center gap-2">
                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusColor(booking.status)}`}>
                                {booking.status === 'waiting_for_deposit' ? 'Deposit Pending' : booking.status?.replaceAll('_', ' ')}
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 md:mt-0 text-right">
                        <div className="text-xs text-gray-500">Received</div>
                        <div className="font-medium text-sm">{new Date(booking.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center border-b pb-2 mb-3">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <User size={18} className="text-[#2E7D46]" /> Client Information
                        </h4>
                        {targetUserId && (
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                title="Report this client"
                            >
                                <AlertTriangle size={14} /> Report Client
                            </button>
                        )}
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8"></div>
                        <div className="flex items-start gap-4 z-10 relative">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                                {clientName.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <div className="font-bold text-lg text-gray-900">{clientName}</div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Mail size={14} /> {clientEmail}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Phone size={14} /> {clientPhone}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <Calendar size={18} className="text-[#2E7D46]" /> Event Details
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                            <div>
                                <span className="block text-xs text-gray-500">Date</span>
                                <span className="font-medium">{new Date(booking.eventDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500">Time</span>
                                <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500">Duration</span>
                                <span className="font-medium">{booking.duration} Hours</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500">Type</span>
                                <span className="font-medium badge bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mt-1">{booking.eventType}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <DollarSign size={18} className="text-[#2E7D46]" /> Payment
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center h-full">
                            <div className="text-center">
                                <span className="text-xs text-gray-500">Total Earnings</span>
                                <div className="text-3xl font-bold text-[#2E7D46] mt-1">${booking.totalAmount}</div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Status: <span className="font-bold uppercase text-gray-700">{booking.paymentStatus?.replaceAll('_', ' ') || 'PENDING'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">

                    {booking.rescheduleRequest && booking.rescheduleRequest.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-yellow-800 font-bold border-b border-yellow-200 pb-2">
                                <Clock size={18} /> Reschedule Request
                            </div>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">New Date:</span>
                                    <span className="font-bold">{new Date(booking.rescheduleRequest.requestedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">New Time:</span>
                                    <span className="font-bold">{booking.rescheduleRequest.requestedStartTime}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 block mb-1">Reason:</span>
                                    <p className="bg-white p-2 rounded border border-yellow-100 text-gray-700 italic">
                                        "{booking.rescheduleRequest.reason}"
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                {onRespondToReschedule && (
                                    <>
                                        <button
                                            onClick={() => onRespondToReschedule(booking._id, 'rejected')}
                                            className="flex-1 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold flex items-center justify-center gap-1"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button
                                            onClick={() => onRespondToReschedule(booking._id, 'accepted')}
                                            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold flex items-center justify-center gap-1"
                                        >
                                            <CheckCircle size={14} /> Accept Reschedule
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {booking.status === 'pending' && onAccept && onReject && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => onReject(booking._id)}
                                className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <XCircle size={18} /> Reject
                            </button>
                            <button
                                onClick={() => onAccept(booking._id)}
                                className="flex-1 py-2.5 bg-[#2E7D46] text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02]"
                            >
                                <CheckCircle size={18} /> Accept Request
                            </button>
                        </div>
                    )}

                    {booking.status === 'accepted' && booking.paymentStatus === 'deposit_paid' && onStartWork && (
                        <button
                            onClick={() => onStartWork(booking._id)}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            <Clock size={18} /> Start Work
                        </button>
                    )}

                    {booking.status === 'work_started' && onEndWork && (
                        <button
                            onClick={() => onEndWork(booking._id)}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            <CheckCircle size={18} /> Mark Work as Ended
                        </button>
                    )}

                    {booking.status === 'work_ended' && booking.paymentStatus === 'full_paid' && onDeliverWork && (
                        <button
                            onClick={() => onDeliverWork(booking._id)}
                            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            <CheckCircle size={18} /> Deliver Final Work
                        </button>
                    )}

                    {booking.status !== 'pending' && !((booking.status === 'accepted' && booking.paymentStatus === 'deposit_paid') || booking.status === 'work_started' || (booking.status === 'work_ended' && booking.paymentStatus === 'full_paid')) && (
                        <div className="flex justify-end">
                            <button onClick={onClose} className="px-6 py-2 bg-gray-100 font-bold text-gray-600 rounded-lg hover:bg-gray-200">Close</button>
                        </div>
                    )}
                </div>
            </div>

            {targetUserId && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    targetId={targetUserId}
                    targetType="user"
                    targetName={clientName}
                />
            )}
        </Modal>
    );
};
