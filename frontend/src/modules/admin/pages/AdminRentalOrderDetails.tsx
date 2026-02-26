

import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../../constants/routes';
import { rentalApi } from '../../../services/api/rentalApi';
import PageTransition from '../../../components/common/PageTransition';
import { ChevronLeft, Calendar, DollarSign, Package, User, Clock, CreditCard, FileText } from 'lucide-react';

import type { IRentalOrder, IUserProfile } from '../../../types/rental';

export default function AdminRentalOrderDetails() {
    const { orderId } = useParams({ strict: false }) as { orderId: string };
    const navigate = useNavigate();

    const { data: orderData, isLoading } = useQuery({
        queryKey: ['admin-rental-order', orderId],
        queryFn: () => rentalApi.getOrderDetails(orderId || ''),
        enabled: !!orderId
    });

    const order = orderData?.data as IRentalOrder;

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
    }

    if (!order) {
        return <div className="p-8 text-center text-red-500">Order not found</div>;
    }

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
        <PageTransition className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate({ to: ROUTES.ADMIN.RENTAL_ORDERS as string })}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</h1>
                    <p className="text-gray-500 text-sm">Created on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusColor(order.status)} border-transparent`}>
                        {order.status === 'WAITING_FOR_DEPOSIT' ? 'Deposit Pending' : order.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package size={20} className="text-blue-500" />
                            Rented Items
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item._id} className="flex gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50">
                                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">Img</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.category}</p>
                                        
                                        <p className="text-xs text-gray-400 mt-1">Owner: {(item.ownerId as IUserProfile)?.name || 'Unknown'}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="font-semibold text-gray-900">${item.pricePerDay}/day</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-blue-500" />
                            Rental Period
                        </h2>
                        <div className="flex items-center gap-8">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Start Date</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    {new Date(order.startDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">End Date</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    {new Date(order.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="ml-auto">
                                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                    {Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={20} className="text-blue-500" />
                            Renter Details
                        </h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold overflow-hidden">
                                {order.renterId?.profileImage ? (
                                    <img src={order.renterId.profileImage} alt={order.renterId.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{order.renterId?.name?.[0]?.toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{order.renterId?.name || 'Unknown User'}</div>
                                <div className="text-sm text-gray-500">{order.renterId?.email}</div>
                            </div>
                        </div>
                        
                        {order.renterId?.phoneNumber && (
                            <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">
                                Phone: {order.renterId.phoneNumber}
                            </div>
                        )}
                        {order.idProof && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-2">ID Proof</p>
                                <a
                                    href={order.idProof}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                                >
                                    <FileText size={14} />
                                    View Document
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-blue-500" />
                            Payment Summary
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Total Amount</span>
                                <span>${order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (10%)</span>
                                <span>${order.taxAmount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Deposit Required</span>
                                <span>${(order.totalAmount * 0.35).toFixed(2)}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-base">
                                <span>Total</span>
                                <span>${order.totalAmount + (order.taxAmount || 0)}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CreditCard size={16} />
                                Payment Method: <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            {order.paymentId && (
                                <div className="text-xs text-gray-400 mt-1 ml-6">ID: {order.paymentId}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

