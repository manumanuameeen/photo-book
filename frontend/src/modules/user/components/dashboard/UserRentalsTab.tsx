import { useState } from "react";
import { motion } from "framer-motion";
import { Package, ChevronLeft, ChevronRight, Search, ShoppingBag, Calendar, Eye, RefreshCw } from "lucide-react";
import type { IRentalOrder } from "../../../../types/rental";
import { ConfirmationModal } from "../../../../components/common/ConfirmationModal";
import { RentalOrderDetailsModal } from "./RentalOrderDetailsModal";
import { CancelOrderModal } from "./CancelOrderModal";

interface UserRentalsTabProps {
    rentalOrders: IRentalOrder[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onBrowse: () => void;
    onCancel: (id: string, reason: string) => void;
    onConfirmReceipt: (id: string) => void;
    onReturnItem: (id: string) => void;
    onPayBalance: (order: IRentalOrder) => void;
    onPayDeposit: (order: IRentalOrder) => void;
    isUpdatingStatus: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    filter: string;
    onFilterChange: (value: string) => void;
    onRefresh: () => void;
}

export const UserRentalsTab = ({
    rentalOrders,
    isLoading,
    page,
    totalPages,
    onPageChange,
    onBrowse,
    onCancel,
    onConfirmReceipt,
    onReturnItem,
    onPayBalance,
    onPayDeposit,
    isUpdatingStatus,
    search,
    onSearchChange,
    filter,
    onFilterChange,
    onRefresh
}: UserRentalsTabProps) => {
    const [selectedOrder, setSelectedOrder] = useState<IRentalOrder | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<{ type: 'confirm' | 'return'; id: string; title: string; message: string; } | null>(null);

    const handleConfirmAction = () => {
        if (!confirmation) return;

        if (confirmation.type === 'confirm') {
            onConfirmReceipt(confirmation.id);
        } else if (confirmation.type === 'return') {
            onReturnItem(confirmation.id);
        }
        setConfirmation(null);
    };

    const handleViewDetails = (order: IRentalOrder) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const handleCancelClick = (orderId: string) => {
        setOrderToCancel(orderId);
        setIsCancelOpen(true);
    };

    const handleCancelConfirm = (reason: string) => {
        if (orderToCancel) {
            onCancel(orderToCancel, reason);
            setIsCancelOpen(false);
            setOrderToCancel(null);
        }
    };

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

    if (!isLoading && rentalOrders.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No rentals yet</h3>
                <button onClick={onBrowse} className="mt-4 px-6 py-2 bg-[#2E7D46] text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">
                    Browse Rentals
                </button>
            </div>
        );
    }

    return (
        <motion.div key="rentals" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search rentals..."
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
                    <option value="WAITING_FOR_DEPOSIT">Deposit Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">Returned</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative min-h-[200px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                )}
                {rentalOrders.map((order: IRentalOrder) => (
                    <div key={order._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-500 font-mono">Order #{order._id.slice(-6).toUpperCase()}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>{order.status === 'WAITING_FOR_DEPOSIT' ? 'Waiting for Deposit' : order.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar size={14} />{new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleViewDetails(order)}
                                    className="p-2 text-gray-400 hover:text-[#2E7D46] hover:bg-green-50 rounded-full transition-all"
                                    title="View Full Details"
                                >
                                    <Eye size={20} />
                                </button>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                
                                {order.status === 'WAITING_FOR_DEPOSIT' && (
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-right mb-1">
                                            <div className="text-sm text-gray-500">Deposit Required</div>
                                            <div className="text-lg font-bold text-[#2E7D46]">${order.depositeRequired || Math.round(order.totalAmount * 0.25)}</div>
                                        </div>
                                        <button
                                            onClick={() => onPayDeposit(order)}
                                            className="bg-[#2E7D46] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm animate-pulse"
                                        >
                                            Pay Deposit Now
                                        </button>
                                        <button
                                            onClick={() => handleCancelClick(order._id)}
                                            disabled={isUpdatingStatus}
                                            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                )}

                                {(['PENDING', 'ACCEPTED', 'CONFIRMED'].includes(order.status)) && (
                                    <button
                                        onClick={() => handleCancelClick(order._id)}
                                        disabled={isUpdatingStatus}
                                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                    >
                                        Cancel Order
                                    </button>
                                )}

                                {order.status === 'SHIPPED' && ((order.amountPaid || 0) >= order.totalAmount) && (
                                    <button
                                        onClick={() => {
                                            setConfirmation({
                                                type: 'confirm',
                                                id: order._id,
                                                title: 'Confirm Receipt',
                                                message: 'Confirm that you have received the item? This will release the funds to the owner.'
                                            });
                                        }}
                                        disabled={isUpdatingStatus}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Confirm Receipt
                                    </button>
                                )}

                                {order.status === 'ONGOING' && (
                                    <button
                                        onClick={() => {
                                            setConfirmation({
                                                type: 'return',
                                                id: order._id,
                                                title: 'Return Item',
                                                message: 'Are you sure you want to return this item?'
                                            });
                                        }}
                                        disabled={isUpdatingStatus}
                                        className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm"
                                    >
                                        Return Item
                                    </button>
                                )}

                                {order.status === 'SHIPPED' && (order.amountPaid || 0) < order.totalAmount && (
                                    <div className="flex flex-col items-end gap-2 mt-2">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">Paid: ${order.amountPaid || 0}</div>
                                            <div className="text-sm font-bold text-red-600">Due: ${(order.totalAmount - (order.amountPaid || 0)).toFixed(2)}</div>
                                        </div>
                                        <button
                                            onClick={() => onPayBalance(order)}
                                            className="bg-[#2E7D46] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm animate-pulse"
                                        >
                                            Pay Remaining Balance
                                        </button>
                                    </div>
                                )}

                                {(order.status !== 'WAITING_FOR_DEPOSIT' && !(order.status === 'SHIPPED' && (order.amountPaid || 0) < order.totalAmount)) && (
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-gray-900">${order.totalAmount}</div>
                                        <div className="text-xs text-gray-400">Total</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {order.items.map((item, idx: number) => (
                                <div key={item._id || idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                        {item.images?.[0] ?
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" /> :
                                            <Package className="w-full h-full p-4 text-gray-300" />
                                        }
                                    </div>
                                    <div><h4 className="font-bold text-gray-800">{item.name}</h4><p className="text-xs text-gray-500">{item.category}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
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

            <RentalOrderDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                order={selectedOrder}
            />

            <ConfirmationModal
                isOpen={!!confirmation}
                onClose={() => setConfirmation(null)}
                onConfirm={handleConfirmAction}
                title={confirmation?.title || ''}
                message={confirmation?.message || ''}
                isConfirming={isUpdatingStatus}
                variant={(() => {
                    if (confirmation?.type === 'return') return 'warning';
                    return 'success';
                })()}
                confirmText={(() => {
                    if (confirmation?.type === 'return') return 'Return Item';
                    return 'Confirm';
                })()}
            />

            <CancelOrderModal
                isOpen={isCancelOpen}
                onClose={() => setIsCancelOpen(false)}
                onConfirm={handleCancelConfirm}
                isSubmitting={isUpdatingStatus}
            />
        </motion.div>
    );
};
