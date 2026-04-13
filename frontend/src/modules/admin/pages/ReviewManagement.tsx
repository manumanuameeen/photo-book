import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, Search, Trash2,
    ChevronLeft, ChevronRight, Loader2,
    AlertCircle, MessageSquare, User,
    MoreVertical
} from 'lucide-react';
import { adminReviewApi } from '../../../services/api/adminReviewApi';
import { toast } from 'sonner';

const AdminReviewManagement: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [rating, setRating] = useState<number | undefined>(undefined);
    const [type, setType] = useState<string>('ALL');
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-reviews', page, search, rating, type],
        queryFn: () => adminReviewApi.getAll({
            page,
            limit: 10,
            search,
            rating,
            type: type === 'ALL' ? undefined : type
        }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminReviewApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            toast.success('Review deleted successfully');
        },
        onError: () => {
            
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            deleteMutation.mutate(id);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 italic">Review Management</h1>
                    <p className="text-sm text-gray-500">Monitor and manage all user feedback across the platform.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search reviews or users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="ALL">All Types</option>
                            <option value="photographer">Photographers</option>
                            <option value="rental">Equipments</option>
                            <option value="package">Packages</option>
                        </select>
                        <select
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={rating || ''}
                            onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)}
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Loading reviews...</p>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center p-8 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    <AlertCircle className="mr-3" />
                    <p className="font-medium">Error loading reviews. Please check your connection.</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-4"
                >
                    <AnimatePresence mode="popLayout">
                        {data?.reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                variants={itemVariants}
                                layout
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                            >
                                {/* Type Indicator */}
                                <div className="absolute top-0 right-0">
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-bl-lg ${review.type === 'photographer' ? 'bg-indigo-600' :
                                        review.type === 'rental' ? 'bg-emerald-600' : 'bg-amber-600'
                                        }`}>
                                        {review.type}
                                    </span>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0 flex md:flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <User size={24} />
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="font-bold text-gray-900">{review.reviewerName}</p>
                                            <p className="text-[11px] text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex-grow space-y-3">
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">on <span className="font-semibold text-gray-700">{review.targetName}</span></span>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                                            <MessageSquare className="absolute -top-2 -left-2 text-gray-200" size={24} />
                                            <p className="text-gray-700 text-sm leading-relaxed italic">"{review.comment}"</p>
                                        </div>

                                        {review.ownerReply && (
                                            <div className="ml-6 border-l-2 border-blue-200 pl-4 py-2">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Owner Response</p>
                                                <p className="text-xs text-gray-600 leading-relaxed">{review.ownerReply}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-row md:flex-col justify-end gap-2">
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            disabled={deleteMutation.isPending}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Review"
                                        >
                                            {deleteMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {data?.reviews.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <MessageSquare size={48} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No reviews match your filters.</p>
                            <button
                                onClick={() => { setSearch(''); setRating(undefined); setType('ALL'); }}
                                className="mt-4 text-blue-600 font-semibold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {}
                    {data && data.total > 10 && (
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-semibold text-gray-900">{(page - 1) * 10 + 1}</span> to <span className="font-semibold text-gray-200">{Math.min(page * 10, data.total)}</span> of <span className="font-semibold text-gray-900">{data.total}</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    disabled={page * 10 >= data.total}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default AdminReviewManagement;
