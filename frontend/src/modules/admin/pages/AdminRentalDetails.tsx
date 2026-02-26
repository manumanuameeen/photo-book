import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '../../../constants/routes';
import { rentalApi } from '../../../services/api/rentalApi';
import { MapPin, Package, ChevronLeft, Check, X, User, Ban } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../../../components/common/PageTransition';

import type { IUserProfile } from '../../../types/rental';

export default function AdminRentalDetails() {
    const { id } = useParams({ strict: false }) as { id: string };
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: itemData, isLoading } = useQuery({
        queryKey: ['rental-item', id],
        queryFn: () => rentalApi.getItemDetails(id!),
        enabled: !!id
    });

    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => rentalApi.updateItemStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rental-item', id] });
            queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
            toast.success("Item status updated");
        },
        onError: () => toast.error("Failed to update status")
    });

    const item = itemData?.data;

    const handleApprove = () => updateStatusMutation.mutate({ id: id!, status: 'AVAILABLE' });
    const handleReject = () => updateStatusMutation.mutate({ id: id!, status: 'REJECTED' });
    const handleBlock = () => updateStatusMutation.mutate({ id: id!, status: 'BLOCKED' });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;
    if (!item) return <div className="min-h-screen flex items-center justify-center">Item not found</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const owner = item.ownerId as IUserProfile;

    return (
        <PageTransition className="min-h-screen bg-gray-50 py-8 px-6 font-sans pb-20">
            <div className="max-w-6xl mx-auto">

                <button
                    onClick={() => navigate({ to: ROUTES.ADMIN.RENTAL_MANAGEMENT })}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
                >
                    <ChevronLeft size={20} /> Back to Management
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                            <div
                                className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative cursor-pointer"
                                onClick={() => item.images?.[0] && setSelectedImage(item.images[0])}
                            >
                                {item.images?.[0] ? (
                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={64} /></div>
                                )}
                                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider shadow-sm ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </div>
                            </div>
                            {item.images?.length > 1 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                    {item.images.map((img: string, i: number) => (
                                        <div
                                            key={i}
                                            className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-green-500 transition-all"
                                            onClick={() => setSelectedImage(img)}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <span className="flex items-center gap-1"><MapPin size={16} /> {item.pickupLocation}</span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{item.category}</span>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Package size={18} className="text-green-600" /> Rental Details
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Price per Day</span>
                                    <span className="font-bold text-gray-900">${item.pricePerDay}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Security Deposit</span>
                                    <span className="font-bold text-gray-900">${item.securityDeposit}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Min Rental Period</span>
                                    <span className="font-bold text-gray-900">{item.minRentalPeriod} Days</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Condition</span>
                                    <span className="font-bold text-gray-900 capitalize">{item.condition}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-500 text-sm">Created At</span>
                                    <span className="font-bold text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={18} className="text-blue-600" /> Owner Information
                            </h3>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                    {owner?.profileImage ? (
                                        <img src={owner.profileImage} alt={owner.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-lg">
                                            {owner?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-gray-900 truncate">{owner?.name || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-500 truncate mb-1">{owner?.email}</p>
                                    {owner?.phone && (
                                        <p className="text-xs bg-gray-100 inline-block px-2 py-1 rounded text-gray-600">
                                            {owner.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {item.status === 'PENDING' && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 border-t-4 border-yellow-400">
                                <h3 className="font-bold text-gray-800 mb-2">Pending Approval</h3>
                                <p className="text-sm text-gray-500 mb-6">This item is waiting for admin approval before it can be listed on the marketplace.</p>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleReject}
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-all"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-green-200 font-bold transition-all"
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                </div>
                            </div>
                        )}

                        {(item.status === 'AVAILABLE' || item.status === 'APPROVED') && (
                            <div className="bg-green-50 rounded-2xl p-6 border border-green-100 text-center">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check size={24} />
                                </div>
                                <h3 className="font-bold text-green-800 mb-1">Item is Live</h3>
                                <p className="text-sm text-green-600 mb-4">This item is currently listed on the marketplace.</p>

                                <button
                                    onClick={handleBlock}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-colors"
                                >
                                    <Ban size={16} /> Block Item
                                </button>
                            </div>
                        )}

                        {item.status === 'REJECTED' && (
                            <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <X size={24} />
                                </div>
                                <h3 className="font-bold text-red-800 mb-1">Item Rejected</h3>
                                <p className="text-sm text-red-600">This item has been rejected and is not visible to users.</p>
                            </div>
                        )}

                        {item.status === 'BLOCKED' && (
                            <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Ban size={24} />
                                </div>
                                <h3 className="font-bold text-red-800 mb-1">Item Blocked</h3>
                                <p className="text-sm text-red-600 mb-4">This item has been blocked by an admin.</p>

                                <button
                                    onClick={handleApprove}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
                                >
                                    <Check size={16} /> Unblock (Make Available)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full view"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </PageTransition>
    );
}
