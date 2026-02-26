import { useState } from 'react';
import { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';
import { rentalApi } from '../../../services/api/rentalApi';
import PageTransition from '../../../components/common/PageTransition';
import { Check, X, Package, ChevronLeft, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRentalManagement() {
    const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const LIMIT = 8;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: listingsData, isLoading: isLoadingListings } = useQuery({
        queryKey: ['admin-listings', statusFilter, page, searchTerm],
        queryFn: () => rentalApi.getAdminItems(statusFilter, page, LIMIT, searchTerm),
        enabled: activeTab === 'listings',
        placeholderData: (prev) => prev
    });

    const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
        queryKey: ['admin-requests', 'PENDING', page],
        queryFn: () => rentalApi.getAdminItems('PENDING', page, LIMIT),
        enabled: activeTab === 'requests',
        placeholderData: (prev) => prev
    });

    const listingsRaw = listingsData?.data?.items;
    const listings = Array.isArray(listingsRaw) ? listingsRaw : [];
    const listingsTotal = listingsData?.data?.total || 0;

    const requestsRaw = requestsData?.data?.items;
    const requests = Array.isArray(requestsRaw) ? requestsRaw : [];
    const requestsTotal = requestsData?.data?.total || 0;

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => rentalApi.updateItemStatus(id, status),
        onSuccess: () => {
            toast.success("Item status updated successfully");
            queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
        },

        onError: (error: AxiosError<{ message: string }>) => {
            console.error('Update status error:', error);
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    });

    const handleApprove = (id: string) => updateStatusMutation.mutate({ id, status: 'AVAILABLE' });
    const handleReject = (id: string) => updateStatusMutation.mutate({ id, status: 'REJECTED' });

    const displayedItems = activeTab === 'listings' ? listings : requests;
    const totalItems = activeTab === 'listings' ? listingsTotal : requestsTotal;
    const totalPages = Math.ceil(totalItems / LIMIT);
    const isLoading = activeTab === 'listings' ? isLoadingListings : isLoadingRequests;

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
                    <h1 className="text-2xl font-bold text-gray-800">Rental Management</h1>
                </div>

                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => { setActiveTab('listings'); setPage(1); }}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'listings'
                            ? 'border-green-600 text-green-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Package size={18} />
                        All Listings
                    </button>
                    <button
                        onClick={() => { setActiveTab('requests'); setPage(1); }}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'requests'
                            ? 'border-yellow-500 text-yellow-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <AlertCircle size={18} />
                        Rental Requests
                        {requestsTotal > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {requestsTotal}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {activeTab === 'listings' && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <Eye className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['ALL', 'AVAILABLE', 'BLOCKED', 'REJECTED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : (
                <>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Item</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Category</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Price/Day</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayedItems.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {item.images?.[0] ? (
                                                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : <Package className="w-full h-full p-2 text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-gray-500 text-xs truncate max-w-[200px]">{item.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{item.category}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">${item.pricePerDay}</td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    px-2.5 py-1 rounded-full text-xs font-semibold
                                                    ${item.status === 'AVAILABLE' || item.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            item.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'}
                                                `}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate({ to: ROUTES.ADMIN.RENTAL_MANAGEMENT_DETAILS.replace('$id', item._id) })}
                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {item.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(item._id)}
                                                                className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                                title="Approve"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(item._id)}
                                                                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedItems.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <p className="font-medium">No items found.</p>
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
    );
}
