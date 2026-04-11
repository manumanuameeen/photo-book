import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalApi } from '../../../services/api/rentalApi';
import type { IRentalItem } from '../../../types/rental';
import { Package, DollarSign, Clock, ChevronLeft, ChevronRight, Calendar, Plus, Filter, Edit2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import PageTransition from '../../../components/common/PageTransition';
import { ManageAvailabilityModal } from '../../../components/rental/ManageAvailabilityModal';
import EditRentalItemModal from '../components/EditRentalItemModal';

export default function MyListings() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);

    const [selectedItem, setSelectedItem] = useState<IRentalItem | null>(null);

    const [managingAvailabilityItem, setManagingAvailabilityItem] = useState<IRentalItem | null>(null);
    const [categoryFilter, setCategoryFilter] = useState("All");
    const LIMIT = 8;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['my-listings', page],
        queryFn: () => rentalApi.getUserItems(page, LIMIT),
        placeholderData: (previousData) => previousData
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => rentalApi.updateItemStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-listings'] });
            toast.success("Item status updated");
        },

        onError: (err: { response?: { data?: { message?: string } } }) => {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    });

    const listingsRaw = data?.data?.items || (data as { items?: unknown })?.items || data?.data;
    const allListings: IRentalItem[] = Array.isArray(listingsRaw) ? listingsRaw : [];

    const listings = categoryFilter === "All"
        ? allListings
        : allListings.filter((item: IRentalItem) => item.category === categoryFilter);

    const totalPages = data?.data?.totalPages || 1;

    const CATEGORIES = ["All", "Cameras", "Lenses", "Lighting", "Drones", "Tripods", "Gimbals", "Audio", "Bags & Cases", "Props", "Others"];

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading listings...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load listings.</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 border border-green-200';
            case 'AVAILABLE': return 'bg-green-100 text-green-800 border border-green-200';
            case 'UNAVAILABLE': return 'bg-gray-100 text-gray-800 border border-gray-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border border-red-200';
            case 'BLOCKED': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <PageTransition className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate({ to: ROUTES.USER.RENT_ITEM })}
                        className="flex items-center gap-2 bg-[#2E7D46] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        List New Item
                    </button>

                    <button
                        onClick={() => refetch()}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[#2E7D46] transition-colors shadow-sm"
                        title="Refresh Listings"
                    >
                        <RefreshCw size={20} />
                    </button>

                    <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium text-gray-600 focus:ring-0 cursor-pointer outline-none"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {listings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No listings found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((item: IRentalItem) => (
                        <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col group">
                            <div className="aspect-video bg-gray-100 relative">
                                {item.images?.[0] ? (
                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase shadow-sm ${getStatusColor(item.status)} `}>
                                    {item.status}
                                </div>

                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="absolute top-2 left-2 p-2 bg-white/90 rounded-full shadow hover:bg-white transition-opacity opacity-0 group-hover:opacity-100 text-gray-700"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.name}</h3>
                                </div>
                                <div className="text-xs text-gray-500 mb-2 px-2 py-0.5 bg-gray-100 w-fit rounded border border-gray-200">{item.category}</div>



                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 mb-4">
                                    <div className="flex items-center text-[#2E7D46] font-bold">
                                        <DollarSign size={16} /> {item.pricePerDay}<span className="text-gray-400 font-normal text-xs ml-1">/day</span>
                                    </div>
                                    <div className="flex items-center text-gray-400 text-xs">
                                        <Clock size={14} className="mr-1" /> {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {['AVAILABLE', 'UNAVAILABLE'].includes(item.status) ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setManagingAvailabilityItem(item)}
                                                    className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Calendar size={14} /> Availability
                                                </button>
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className="py-2 px-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => updateStatusMutation.mutate({
                                                    id: item._id,
                                                    status: item.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE'
                                                })}
                                                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${item.status === 'AVAILABLE'
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                                    : 'bg-[#2E7D46] text-white hover:bg-green-700 shadow-sm'
                                                    }`}
                                            >
                                                {item.status === 'AVAILABLE' ? 'Mark as Unavailable' : 'Make Available'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full py-2 px-4 bg-gray-50 text-gray-500 rounded-lg text-sm font-medium text-center border border-gray-200 cursor-not-allowed">
                                            Status: {item.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {categoryFilter === "All" && (
                <div className="flex justify-center mt-12 gap-2">
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
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {selectedItem && (
                <EditRentalItemModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
            {managingAvailabilityItem && (
                <ManageAvailabilityModal
                    itemId={managingAvailabilityItem._id}
                    onClose={() => setManagingAvailabilityItem(null)}
                />
            )}
        </PageTransition>
    );
}
