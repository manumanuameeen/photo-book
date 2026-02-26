import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';
import { rentalApi } from '../../../services/api/rentalApi';
import PageTransition from '../../../components/common/PageTransition';
import { ChevronLeft, ShoppingBag, Eye, Calendar, User } from 'lucide-react';
import type { IRentalOrder } from '../../../types/rental';

function AdminRentalOrders() {
    const [page, setPage] = useState(1);
    const LIMIT = 8;
    const navigate = useNavigate();

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['admin-rental-orders', page],
        queryFn: () => rentalApi.getAllRentalOrders(page, 8),
        placeholderData: (prev) => prev
    });

    const ordersRaw = ordersData?.data?.orders;
    const orders = Array.isArray(ordersRaw) ? ordersRaw : [];
    const totalOrders = ordersData?.data?.total || 0;
    const totalPages = Math.ceil(totalOrders / LIMIT);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            ACCEPTED: 'bg-green-100 text-green-800',
            WAITING_FOR_DEPOSIT: 'bg-orange-100 text-orange-800',
            REJECTED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            COMPLETED: 'bg-blue-100 text-blue-800',
            CONFIRMED: 'bg-green-100 text-green-800',
            ONGOING: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <PageTransition className="p-6">
            <div className="flex flex-col mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate({ to: ROUTES.ADMIN.DASHBOARD })}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Rental Orders</h1>
                </div>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-gray-500">Loading orders...</div>
            ) : (
                <>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Order ID</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Renter</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Items</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Dates</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Amount</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order: IRentalOrder) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                                        {order.renterId?.profileImage ? (
                                                            <img src={order.renterId.profileImage} alt={order.renterId.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={16} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{order.renterId?.name || 'Unknown'}</div>
                                                        <div className="text-gray-500 text-xs">{order.renterId?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {order.items.map((item) => (
                                                        <span key={item._id} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 w-fit">
                                                            {item.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                    <Calendar size={14} />
                                                    {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">${order.totalAmount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {order.status === 'WAITING_FOR_DEPOSIT' ? 'Deposit Pending' : order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate({ to: ROUTES.ADMIN.RENTAL_ORDER_DETAILS.replace('$id', order._id) })}
                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <ShoppingBag size={48} className="text-gray-300 mb-4" />
                                                    <p className="font-medium">No rental orders found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-4 py-2 bg-white border rounded-lg flex items-center text-gray-600 font-medium">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600 transform rotate-180"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </PageTransition>
    )
}

export default AdminRentalOrders;

