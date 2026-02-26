import React from 'react';
import { Modal } from '../../../../components/common/Modal';
import { Package, User, DollarSign, Clock, Calendar, ShieldCheck, FileText } from 'lucide-react';
import type { IRentalOrder } from '../../../../types/rental';
import { RescheduleModal } from '../../../../components/common/RescheduleModal';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalApi } from '../../../../services/api/rentalApi';
import { toast } from 'sonner';

interface RentalOrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: IRentalOrder | null;
}

export const RentalOrderDetailsModal: React.FC<RentalOrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const rescheduleMutation = useMutation({
        mutationFn: (data: { startDate?: string; endDate?: string; reason: string }) => {
            if (!order || !data.startDate || !data.endDate) throw new Error("Invalid data");
            return rentalApi.requestReschedule(order._id, new Date(data.startDate), new Date(data.endDate), data.reason);
        },
        onSuccess: () => {
            toast.success("Reschedule request sent successfully");
            setIsRescheduleModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['user-rental-orders'] });
            onClose();

        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to request reschedule");
        }
    });

    const handleRescheduleConfirm = (data: { startDate?: string; endDate?: string; reason: string }) => {
        rescheduleMutation.mutate(data);
    };

    if (!order) return null;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            ACCEPTED: 'bg-green-50 text-green-700 border-green-200',
            WAITING_FOR_DEPOSIT: 'bg-orange-50 text-orange-700 border-orange-200',
            REJECTED: 'bg-red-50 text-red-700 border-red-200',
            CANCELLED: 'bg-gray-50 text-gray-700 border-gray-200',
            COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
            CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            ONGOING: 'bg-purple-50 text-purple-700 border-purple-200',
            SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            RETURNED: 'bg-amber-50 text-amber-700 border-amber-200',
            DELIVERED: 'bg-teal-50 text-teal-700 border-teal-200'
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const firstItem = order.items?.[0];
    const owner = firstItem?.ownerId;

    const isOwnerPopulated = (o: unknown): o is { name: string; email: string; profileImage?: string; phone?: string } => {
        return typeof o === 'object' && o !== null && 'name' in o;
    };

    const ownerName = isOwnerPopulated(owner) ? owner.name : 'Unknown Owner';
    const ownerEmail = isOwnerPopulated(owner) ? owner.email : '';
    const ownerPhone = isOwnerPopulated(owner) ? owner.phone : '';
    const ownerImage = isOwnerPopulated(owner) && owner.profileImage ? owner.profileImage : null;

    const startDate = new Date(order.startDate);
    const endDate = new Date(order.endDate);
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rental Order Details" width="max-w-4xl">
            <div className="flex flex-col md:flex-row h-[80vh] md:h-auto overflow-hidden bg-white rounded-b-xl">

                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
                    
                    <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 shadow-sm ${getStatusColor(order.status)}`}>
                        <div className="text-xs font-bold uppercase tracking-wider opacity-80">Status</div>
                        <div className="font-extrabold text-lg">
                            {order.status === 'WAITING_FOR_DEPOSIT' ? 'Deposit Pending' : order.status.replaceAll('_', ' ')}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-3 flex items-center gap-2">
                                <FileText size={14} /> Order Info
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Order ID</span>
                                    <span className="font-mono font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-3 flex items-center gap-2">
                                <Clock size={14} /> Duration
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Pickup</div>
                                        <div className="text-sm font-bold text-gray-900">{startDate.toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="h-4 border-l-2 border-dashed border-gray-300 ml-5"></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Return</div>
                                        <div className="text-sm font-bold text-gray-900">{endDate.toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-100 flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500">Total Duration</span>
                                    <span className="text-sm font-bold text-[#2E7D46]">{durationDays} Days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-2/3 p-6 overflow-y-auto space-y-8">

                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="text-[#2E7D46]" size={20} /> Rented Items
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {order.items.map((item, idx) => (
                                <div key={item._id || idx} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                        {item.images?.[0] ?
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" /> :
                                            <Package className="w-full h-full p-6 text-gray-300" />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase mt-1">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">${item.pricePerDay.toFixed(2)}</div>
                                                <div className="text-[10px] text-gray-500">/day</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Item Total ({durationDays} days)</span>
                                            <span className="font-medium">${(item.pricePerDay * durationDays).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="text-[#2E7D46]" size={20} /> Payment Details
                            </h3>
                            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Security Deposit</span>
                                    <span className="font-medium text-gray-500 italic">Included</span>
                                </div>
                                <div className="border-t border-dashed border-gray-300 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="font-extrabold text-xl text-gray-900">${order.totalAmount.toFixed(2)}</span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">Paid Amount</span>
                                        <span className="font-bold text-green-600">${(order.amountPaid || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, ((order.amountPaid || 0) / order.totalAmount) * 100)}%` }}
                                        ></div>
                                    </div>
                                    {(order.totalAmount - (order.amountPaid || 0)) > 0.01 && (
                                        <div className="flex justify-between items-center text-sm text-red-600 font-bold bg-red-50 p-2 rounded-lg mt-2">
                                            <span>Remaining Due</span>
                                            <span>${(order.totalAmount - (order.amountPaid || 0)).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="text-[#2E7D46]" size={20} /> Owner
                                </h3>
                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                        {ownerImage ?
                                            <img src={ownerImage} alt={ownerName} className="w-full h-full object-cover" /> :
                                            <User className="w-full h-full p-3 text-gray-400" />
                                        }
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{ownerName}</div>
                                        <div className="text-xs text-gray-500">{ownerEmail}</div>
                                        {ownerPhone && <div className="text-xs text-gray-500">{ownerPhone}</div>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck className="text-[#2E7D46]" size={20} /> Instructions
                                </h3>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                                    <p className="mb-2 font-medium">Please ensure to:</p>
                                    <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
                                        <li>Bring valid ID proof for pickup.</li>
                                        <li>Inspect items before accepting.</li>
                                        <li>Return items on time to avoid penalties.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
                
                <div className="flex gap-2">
                    {!['COMPLETED', 'REJECTED', 'CANCELLED', 'RETURNED', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                        <button
                            onClick={() => setIsRescheduleModalOpen(true)}
                            className={`px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 ${order.rescheduleRequest?.status === 'pending'
                                ? "bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100"
                                : "bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                                }`}
                        >
                            <Calendar size={16} />
                            {order.rescheduleRequest?.status === 'pending' ? 'Update Reschedule' : 'Reschedule'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>

            <RescheduleModal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                onConfirm={handleRescheduleConfirm}
                mode="rental"
                isLoading={rescheduleMutation.isPending}
                currentStartDate={order.startDate.toString()}
                currentEndDate={order.endDate.toString()}
                itemId={order.items?.[0]?._id}
                pricePerDay={order.items?.reduce((sum, item) => sum + (item.pricePerDay || 0), 0)}
                orderTotalAmount={order.totalAmount}
                amountPaid={order.amountPaid}
            />
        </Modal>
    );
};

