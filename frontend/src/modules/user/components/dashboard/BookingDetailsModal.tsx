import React, { useState } from 'react';
import { Modal } from '../../../../components/common/Modal';
import { Calendar, User, DollarSign, MapPin, Camera, Package, Mail, CheckCircle, ShieldCheck, FileText } from 'lucide-react';
import type { BookingDetails } from '../../../../services/api/bookingApi';
import { clsx } from 'clsx';
import { RescheduleModal } from '../../../../components/common/RescheduleModal';
import { bookingApi } from '../../../../services/api/bookingApi';
import { toast } from 'sonner';
import { CancelOrderModal } from './CancelOrderModal';

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: BookingDetails | null;
    onPayDeposit?: (booking: BookingDetails) => void;
    onConfirmEndWork?: (id: string) => void;
    onPayBalance?: (booking: BookingDetails) => void;
    onConfirmDelivery?: (id: string) => void;
    onCancel?: (id: string, reason: string) => void;
    isCancelling?: boolean;
}

const BookingTimeline = ({ booking }: { booking: BookingDetails }) => {
    const steps = [
        { id: 'request_sent', label: 'Request Sent', completed: true, date: booking.createdAt },
        { id: 'accepted', label: 'Accepted', completed: ['accepted', 'waiting_for_deposit', 'work_started', 'work_ended_pending', 'work_ended', 'work_delivered', 'completed', 'confirmed'].includes(booking.status) },
        { id: 'deposit_paid', label: 'Deposit Paid', completed: ['work_started', 'work_ended_pending', 'work_ended', 'work_delivered', 'completed', 'confirmed'].includes(booking.status) || booking.paymentStatus === 'deposit_paid' || booking.paymentStatus === 'full_paid' },
        { id: 'work_started', label: 'Work Started', completed: ['work_started', 'work_ended_pending', 'work_ended', 'work_delivered', 'completed', 'confirmed'].includes(booking.status) },
        { id: 'work_ended', label: 'Work Ended', completed: ['work_ended_pending', 'work_ended', 'work_delivered', 'completed', 'confirmed'].includes(booking.status) },
        { id: 'completed', label: 'Completed', completed: ['completed', 'confirmed', 'work_delivered'].includes(booking.status) }
    ];

    let currentStepIndex = steps.findIndex(s => !s.completed);
    if (currentStepIndex === -1) currentStepIndex = steps.length - 1;

    return (
        <div className="py-2">
            <h4 className="text-xs font-bold uppercase text-gray-500 mb-4">Tracking History</h4>
            <div className="relative pl-2">
                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

                {steps.map((step, idx) => {
                    const isCompleted = step.completed;
                    const isCurrent = idx === currentStepIndex && !isCompleted;

                    return (
                        <div key={step.id} className="relative flex items-start gap-4 mb-6 last:mb-0 group">
                            <div className={clsx(
                                "z-10 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all",
                                isCompleted ? "bg-green-600 border-green-600" : (isCurrent ? "bg-white border-green-600 animate-pulse" : "bg-white border-gray-300")
                            )}>
                                {isCompleted && <CheckCircle size={12} className="text-white" />}
                                {!isCompleted && isCurrent && <div className="w-2 h-2 bg-green-600 rounded-full"></div>}
                            </div>
                            <div className="flex-1 -mt-1">
                                <p className={clsx("text-sm font-bold", isCompleted || isCurrent ? "text-gray-900" : "text-gray-400")}>{step.label}</p>
                                {step.date && <p className="text-[10px] text-gray-400">{new Date(step.date).toLocaleDateString()}</p>}
                                {step.id === 'deposit_paid' && booking.paymentStatus === 'deposit_paid' && <p className="text-[10px] text-green-600 font-medium">Paid ${(booking.totalAmount * 0.25).toFixed(2)}</p>}
                                {step.id === 'deposit_paid' && booking.paymentStatus === 'pending' && booking.status === 'waiting_for_deposit' && <p className="text-[10px] text-orange-600 font-medium">Pending</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
    isOpen, onClose, booking, onPayDeposit, onConfirmEndWork, onPayBalance, onConfirmDelivery, onCancel, isCancelling
}) => {
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isRescheduling, setIsRescheduling] = useState(false);

    if (!booking) return null;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            accepted: 'bg-green-50 text-green-700 border-green-200',
            waiting_for_deposit: 'bg-orange-50 text-orange-700 border-orange-200',
            rejected: 'bg-red-50 text-red-700 border-red-200',
            cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
            completed: 'bg-blue-50 text-blue-700 border-blue-200',
            confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            ongoing: 'bg-purple-50 text-purple-700 border-purple-200',
            work_started: 'bg-blue-50 text-blue-700 border-blue-200',
            work_ended_pending: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            work_ended: 'bg-purple-50 text-purple-700 border-purple-200',
            work_delivered: 'bg-teal-50 text-teal-700 border-teal-200'
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const photographerName = booking.photographerId ? (booking.photographerId.name || 'Photographer') : 'Account Deleted';
    const photographerEmail = booking.photographerId?.email || '';
    const photographerImage = booking.photographerId?.profileImage || null;
    const photographerUsername = booking.photographerId?.username || '';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" width="max-w-4xl">
            <div className="flex flex-col md:flex-row h-[80vh] md:h-auto overflow-hidden bg-white rounded-b-xl">
                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
                    <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 shadow-sm ${getStatusColor(booking.status)}`}>
                        <div className="text-xs font-bold uppercase tracking-wider opacity-80">Status</div>
                        <div className="font-extrabold text-lg">
                            {booking.status === 'waiting_for_deposit' ? 'Deposit Pending' : booking.status?.replace(/_/g, ' ')}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <BookingTimeline booking={booking} />
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-3 flex items-center gap-2">
                                <FileText size={14} /> Booking Info
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Booking ID</span>
                                    <span className="font-mono font-medium text-gray-900">#{booking._id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created</span>
                                    <span className="font-medium text-gray-900">{new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-2/3 p-6 overflow-y-auto space-y-8">
                    
                    {booking.rescheduleRequest?.requestedDate && booking.rescheduleRequest.status !== 'expired' && (
                        <div className={clsx(
                            "p-4 rounded-xl border flex items-start gap-3",
                            booking.rescheduleRequest.status === 'pending' ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                                booking.rescheduleRequest.status === 'rejected' ? "bg-red-50 border-red-200 text-red-800" :
                                    booking.rescheduleRequest.status === 'accepted' ? "bg-green-50 border-green-200 text-green-800" : ""
                        )}>
                            <div className="flex-shrink-0 mt-0.5"><div className="w-4 h-4 rounded-full bg-current opacity-20"></div></div>
                            <div>
                                <h4 className="font-bold text-sm">
                                    Reschedule Request {
                                        booking.rescheduleRequest.status === 'pending' ? 'Pending' :
                                            booking.rescheduleRequest.status === 'rejected' ? 'Rejected' :
                                                booking.rescheduleRequest.status === 'accepted' ? 'Accepted ✓' : ''
                                    }
                                </h4>
                                <p className="text-xs mt-1">
                                    {booking.rescheduleRequest.status === 'accepted' ? 'New' : 'Requested'} Date: <strong>{new Date(booking.rescheduleRequest.requestedDate).toLocaleDateString()} {booking.rescheduleRequest.requestedStartTime}</strong>
                                </p>
                                {booking.rescheduleRequest.status === 'rejected' && (
                                    <p className="text-xs mt-1">The photographer rejected this request. The original booking still stands.</p>
                                )}
                                {booking.rescheduleRequest.status === 'pending' && (
                                    <p className="text-xs mt-1">Waiting for photographer approval...</p>
                                )}
                                {booking.rescheduleRequest.status === 'accepted' && (
                                    <p className="text-xs mt-1">The photographer accepted your request. Your booking has been rescheduled!</p>
                                )}
                            </div>
                        </div>
                    )}

                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Camera className="text-[#2E7D46]" size={20} /> Photographer
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                {photographerImage ? (
                                    <img src={photographerImage} alt={photographerName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-full h-full p-6 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">{photographerName}</h4>
                                {photographerUsername && <div className="text-sm text-gray-500 mb-2">@{photographerUsername}</div>}
                                {!booking.photographerId && <div className="text-xs text-red-500 font-bold">This photographer account no longer exists.</div>}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                                    {photographerEmail && (
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} /> {photographerEmail}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <section className="space-y-4">
                            <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3 h-full">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Package size={18} className="text-[#2E7D46]" /> Package
                                </h4>
                                <div>
                                    <div className="font-medium text-gray-900">{booking.packageId.name}</div>
                                    <div className="text-xl font-bold text-[#2E7D46] mt-1">${booking.packageId.price}</div>
                                </div>
                                {booking.packageId.features && booking.packageId.features.length > 0 && (
                                    <ul className="space-y-1 mt-2">
                                        {booking.packageId.features.slice(0, 3).map((feature, idx) => (
                                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                                <CheckCircle size={12} className="text-green-500 mt-0.5" /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3 h-full">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar size={18} className="text-[#2E7D46]" /> Schedule
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-500">Date</div>
                                        <div className="text-sm font-bold text-gray-900">{new Date(booking.eventDate).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Time</div>
                                        <div className="text-sm font-bold text-gray-900">
                                            {booking.startTime} {booking.endTime ? `- ${booking.endTime}` : ''}
                                        </div>
                                    </div>
                                    {booking.location && (
                                        <div>
                                            <div className="text-xs text-gray-500">Location</div>
                                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                                <MapPin size={12} /> {booking.location}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="text-[#2E7D46]" size={20} /> Payment Details
                        </h3>
                        <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Package Base Price</span>
                                <span className="font-medium">${booking.packageId.price}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Platform Fee</span>
                                <span className="font-medium text-gray-400 text-xs">(Included)</span>
                            </div>

                            {!!booking.depositeRequired && (
                                <div className="flex justify-between items-center text-sm bg-orange-50 p-2 rounded border border-orange-100">
                                    <span className="text-orange-800 font-medium">Required Deposit (25%)</span>
                                    <span className="font-bold text-orange-800">${booking.depositeRequired}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Payment Status</span>
                                <span className={clsx("font-bold uppercase px-2 py-0.5 rounded text-xs",
                                    booking.paymentStatus === 'full_paid' ? "bg-green-100 text-green-700" :
                                        booking.paymentStatus === 'deposit_paid' ? "bg-blue-100 text-blue-700" :
                                            "bg-gray-100 text-gray-700"
                                )}>
                                    {booking.paymentStatus?.replace(/_/g, ' ') || 'PENDING'}
                                </span>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total Amount</span>
                                <span className="font-extrabold text-xl text-gray-900">${booking.totalAmount}</span>
                            </div>
                        </div>
                    </section>

                    {booking.deliveryWorkLink && (
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="text-indigo-600" size={20} /> Delivered Work
                            </h3>
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                                <p className="text-sm text-indigo-900 mb-3 font-medium">
                                    The photographer has delivered your work. Please review it using the link below:
                                </p>
                                <a
                                    href={booking.deliveryWorkLink?.startsWith('http') ? booking.deliveryWorkLink : `https://${booking.deliveryWorkLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-3 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-bold hover:bg-indigo-50 transition-colors break-all"
                                >
                                    <div className="bg-indigo-100 p-2 rounded-full">
                                        <FileText size={16} />
                                    </div>
                                    <span className="truncate">{booking.deliveryWorkLink}</span>
                                </a>
                            </div>
                        </section>
                    )}

                </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl flex-wrap">
                {booking.status === 'waiting_for_deposit' && onPayDeposit && (
                    <button
                        onClick={() => onPayDeposit(booking)}
                        className="px-6 py-2.5 bg-[#2E7D46] text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <DollarSign size={16} /> Pay Deposit
                    </button>
                )}

                {booking.status === 'work_ended_pending' && onConfirmEndWork && (
                    <button
                        onClick={() => onConfirmEndWork(booking._id)}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <CheckCircle size={16} /> Confirm Work Ended
                    </button>
                )}

                {booking.status === 'work_ended' && booking.paymentStatus !== 'full_paid' && onPayBalance && (
                    <button
                        onClick={() => onPayBalance(booking)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <DollarSign size={16} /> Pay Remaining Balance
                    </button>
                )}

                {booking.status === 'work_delivered' && onConfirmDelivery && (
                    <button
                        onClick={() => onConfirmDelivery(booking._id)}
                        className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <ShieldCheck size={16} /> Confirm Delivery & Complete
                    </button>
                )}

                {!['completed', 'rejected', 'cancelled', 'work_started', 'work_ended_pending', 'work_ended', 'work_delivered'].includes(booking.status) && (
                    <button
                        onClick={() => setIsRescheduleModalOpen(true)}
                        className={clsx(
                            "px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2",
                            booking.rescheduleRequest?.status === 'pending'
                                ? "bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100"
                                : "bg-white border border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                        )}
                    >
                        <Calendar size={16} />
                        {booking.rescheduleRequest?.status === 'pending' ? 'Update Reschedule' : 'Request Reschedule'}
                    </button>
                )}

                {!['completed', 'rejected', 'cancelled', 'work_started', 'work_ended', 'work_ended_pending', 'work_delivered'].includes(booking.status) && onCancel && (
                    <button
                        onClick={() => setIsCancelModalOpen(true)}
                        disabled={isCancelling}
                        className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2"
                    >
                        {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                )}

                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-sm"
                >
                    Close
                </button>
            </div>

            <CancelOrderModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={(reason) => {
                    if (onCancel) {
                        onCancel(booking._id, reason);
                        setIsCancelModalOpen(false);
                    }
                }}
                isSubmitting={!!isCancelling}
                title="Cancel Booking"
                message="Are you sure you want to cancel this booking? Please provide a reason."
                cancelText="Keep Booking"
                confirmText="Cancel Booking"
                note="Cancellation policies may apply. Please review the terms or contact the photographer if you have questions."
            />

            <RescheduleModal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                onConfirm={async (data) => {
                    if (!data.date || !data.startTime) return;
                    setIsRescheduling(true);
                    try {
                        await bookingApi.requestReschedule(booking._id, {
                            newDate: new Date(data.date),
                            newStartTime: data.startTime,
                            reason: data.reason
                        });
                        toast.success("Reschedule request sent");
                        setIsRescheduleModalOpen(false);
                        onClose();
                        globalThis.location.reload();
                    } catch (error: unknown) {
                        const err = error as { message?: string };
                        toast.error(err.message || "Failed to reschedule");
                    } finally {
                        setIsRescheduling(false);
                    }
                }}
                mode="booking"
                isLoading={isRescheduling}
                currentDate={booking.eventDate.toString()}
                currentTime={booking.startTime}
                photographerId={booking.photographerId?._id}
            />
        </Modal>
    );
};
