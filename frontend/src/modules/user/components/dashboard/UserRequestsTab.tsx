import { useState } from 'react';
import { motion } from "framer-motion";
import { Calendar, User, Clock, ChevronLeft, ChevronRight, Search, Eye, RefreshCw } from "lucide-react";
import type { IRentalOrder } from "../../../../types/rental";
import { ConfirmationModal } from "../../../../components/common/ConfirmationModal";
import { RentalOrderDetailsModal } from "./RentalOrderDetailsModal";
import { ReportModal } from "../../../../components/common/ReportModal";
import { AlertTriangle } from "lucide-react";

interface UserRequestsTabProps {
    rentalRequests: IRentalOrder[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    onStatusUpdate: (id: string, status: string) => void;
    onRespondToReschedule: (id: string, action: 'approve' | 'reject') => void;
    isAccepting: boolean;
    isRejecting: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    filter: string;
    onFilterChange: (value: string) => void;
    onRefresh: () => void;
}

export const UserRequestsTab = ({
    rentalRequests,
    isLoading,
    page,
    totalPages,
    onPageChange,
    onAccept,
    onReject,
    onRespondToReschedule,
    onStatusUpdate,
    isAccepting,
    isRejecting,
    search,
    onSearchChange,
    filter,
    onFilterChange,
    onRefresh
}: UserRequestsTabProps) => {

    const [confirmation, setConfirmation] = useState<{ id: string; status: string; } | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<IRentalOrder | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [reportingUser, setReportingUser] = useState<{ id: string; name: string } | null>(null);

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
            SHIPPED: 'bg-blue-100 text-blue-800',
            RETURNED: 'bg-amber-100 text-amber-800',
            DELIVERED: 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (rentalRequests.length === 0 && !search && !filter) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No incoming orders</h3>
            </div>
        );
    }

    return (
        <motion.div key="requests" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search requests..."
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
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="WAITING_FOR_DEPOSIT">Waiting for Deposit</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="RETURNED">Returned</option>
                    <option value="DELIVERED">Delivered</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4 relative min-h-[200px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                )}
                {rentalRequests.length === 0 && !isLoading ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                        No requests found
                    </div>
                ) : (
                    rentalRequests.map((req: IRentalOrder) => (
                        <div key={req._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                        {req.renterId?.profileImage ?
                                            <img src={req.renterId.profileImage} alt={req.renterId.name} className="w-full h-full object-cover" /> :
                                            <User className="w-full h-full p-2 text-gray-400" />
                                        }
                                    </div>
                                    <div><h4 className="font-bold text-gray-900">{req.renterId?.name}</h4><p className="text-xs text-gray-500">{req.renterId?.email}</p></div>
                                    {(req.renterId?._id || (typeof req.renterId === 'string' ? req.renterId : null)) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const targetId = req.renterId?._id || (typeof req.renterId === 'string' ? req.renterId : '');
                                                const targetName = req.renterId?.name || 'Renter';
                                                setReportingUser({ id: targetId, name: targetName });
                                            }}
                                            className="ml-2 px-2 py-1 flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-100 transition-colors"
                                            title="Report this renter"
                                        >
                                            <AlertTriangle size={12} />
                                            Report
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }}
                                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-[#2E7D46] transition-colors"
                                            title="View Full Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(req.status)}`}>{req.status}</span>
                                    </div>
                                    {['CONFIRMED', 'SHIPPED', 'DELIVERED', 'ONGOING', 'RETURNED'].includes(req.status as string) && (
                                        <select
                                            className="text-[10px] border border-gray-200 rounded p-1 bg-gray-50 text-gray-700 cursor-pointer hover:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                            value={req.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                setConfirmation({ id: req._id, status: newStatus });
                                            }}
                                        >
                                            <option value="CONFIRMED" disabled>CONFIRMED</option>
                                            <option value="SHIPPED" disabled={req.status === 'SHIPPED' || req.status === 'ONGOING' || req.status === 'RETURNED' || req.status === 'COMPLETED'}>SHIPPED</option>
                                            <option value="DELIVERED" disabled>DELIVERED (Legacy)</option>
                                            <option value="ONGOING" disabled={req.status === 'ONGOING' || req.status === 'RETURNED' || req.status === 'COMPLETED'}>ONGOING</option>
                                            <option value="RETURNED" disabled={req.status === 'RETURNED' || req.status === 'COMPLETED'}>RETURNED</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            {
                                req.rescheduleRequest?.status === 'pending' && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
                                        <div className="flex items-start gap-3">
                                            <Clock className="text-yellow-600 mt-0.5" size={16} />
                                            <div className="flex-1">
                                                <h5 className="text-sm font-bold text-yellow-800">Reschedule Requested</h5>
                                                <p className="text-xs text-yellow-700 mt-1">
                                                    New Dates: <strong>{new Date(req.rescheduleRequest.requestedStartDate).toLocaleDateString()} - {new Date(req.rescheduleRequest.requestedEndDate).toLocaleDateString()}</strong>
                                                </p>
                                                <p className="text-xs text-yellow-700 italic mt-1">"{req.rescheduleRequest.reason}"</p>

                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => onRespondToReschedule(req._id, 'approve')}
                                                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded shadow-sm hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve New Dates
                                                    </button>
                                                    <button
                                                        onClick={() => onRespondToReschedule(req._id, 'reject')}
                                                        className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            < div className="bg-gray-50 p-3 rounded-lg flex items-center gap-4 text-sm text-gray-500 border border-gray-100" >

                                <div className="flex items-center gap-2"><Calendar size={14} />{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</div>
                                <div className="flex items-center gap-2 font-bold text-gray-800"><span className="text-gray-500 font-normal">Total:</span> ${req.totalAmount}</div>
                            </div>
                            <div className="bg-green-50/50 p-3 rounded-lg border border-green-100 flex flex-col gap-1 text-xs">
                                <div className="flex justify-between text-gray-500">
                                    <span>Platform Fee (8%) <span className="text-[10px] text-green-600">(Credited to Admin)</span></span>
                                    <span>-${(req.totalAmount * 0.08).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-green-800 border-t border-green-200 pt-1 mt-1">
                                    <span>Your Net Earning</span>
                                    <span>${(req.totalAmount * 0.92).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {req.items.map((item, idx: number) => (
                                    <div key={item._id || idx} className="flex gap-3 items-center">
                                        <div className="w-8 h-8 bg-white rounded overflow-hidden border border-gray-200">
                                            {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                            {
                                req.status === 'PENDING' && (
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => onAccept(req._id)} disabled={isAccepting || isRejecting} className="flex-1 py-2 bg-[#2E7D46] text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-md">{isAccepting ? 'Accepting...' : 'Accept Request'}</button>
                                        <button onClick={() => onReject(req._id)} disabled={isAccepting || isRejecting} className="flex-1 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50">{isRejecting ? 'Rejecting...' : 'Reject'}</button>
                                    </div>
                                )
                            }
                        </div>
                    )))
                }
            </div >
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

            <ConfirmationModal
                isOpen={!!confirmation}
                onClose={() => setConfirmation(null)}
                onConfirm={() => {
                    if (confirmation) {
                        onStatusUpdate(confirmation.id, confirmation.status);
                        setConfirmation(null);
                    }
                }}
                title="Update Order Status"
                message={`Are you sure you want to change the status to ${confirmation?.status}?`}
                confirmText="Update Status"
            />

            <RentalOrderDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                order={selectedRequest}
            />

            {reportingUser && (
                <ReportModal
                    isOpen={!!reportingUser}
                    onClose={() => setReportingUser(null)}
                    targetId={reportingUser.id}
                    targetType="user"
                    targetName={reportingUser.name}
                />
            )}

        </motion.div >
    );
};
