import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Edit2, Trash2, MessageSquare, ChevronLeft, ChevronRight, RefreshCw, Loader2, User, Package, ShoppingBag, Pencil, Inbox, Send } from "lucide-react";
import { reviewApi } from "../../../../services/api/reviewApi";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Review, ReviewUpdatePayload } from "../../../../types/review";
import { getErrorMessage } from "../../../../utils/errorhandler";

interface UserReviewsTabProps {
    onRefresh?: () => void;
}

interface EnrichedReview extends Review {
    targetName: string;
    targetImage?: string;
}

type ReviewTab = 'given' | 'received';

export const UserReviewsTab = ({ onRefresh }: UserReviewsTabProps) => {
    const [activeTab, setActiveTab] = useState<ReviewTab>('given');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();
    const [editingReview, setEditingReview] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState("");

    const { data: givenData, isLoading: isLoadingGiven } = useQuery({
        queryKey: ['user-my-reviews', page, debouncedSearch],
        queryFn: () => reviewApi.getUserReviews(page, 5, debouncedSearch),
        enabled: activeTab === 'given'
    });

    const { data: receivedData, isLoading: isLoadingReceived } = useQuery({
        queryKey: ['user-received-reviews', page, debouncedSearch],
        queryFn: () => reviewApi.getReceivedReviews(page, 5, debouncedSearch),
        enabled: activeTab === 'received'
    });

    const isLoading = activeTab === 'given' ? isLoadingGiven : isLoadingReceived;
    const data = activeTab === 'given' ? givenData : receivedData;
    const reviews = (data?.reviews || []) as EnrichedReview[];
    const totalPages = Math.ceil((data?.total || 0) / 5) || 1;

    const deleteMutation = useMutation({
        mutationFn: (id: string) => reviewApi.deleteReview(id),
        onSuccess: () => {
            toast.success("Review deleted successfully");
            queryClient.invalidateQueries({ queryKey: [activeTab === 'given' ? 'user-my-reviews' : 'user-received-reviews'] });
            if (onRefresh) onRefresh();
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error) || "Failed to delete review")
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ReviewUpdatePayload }) =>
            reviewApi.updateReview(id, payload),
        onSuccess: () => {
            toast.success("Review updated successfully");
            setEditingReview(null);
            queryClient.invalidateQueries({ queryKey: ['user-my-reviews'] });
            if (onRefresh) onRefresh();
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error) || "Failed to update review")
    });

    const handleStartEdit = (review: EnrichedReview) => {
        setEditingReview(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
    };

    const handleSaveEdit = (id: string) => {
        if (editRating === 0) {
            toast.error("Please provide a rating");
            return;
        }
        if (editComment.trim().length < 10) {
            toast.error("Comment must be at least 10 characters");
            return;
        }
        updateMutation.mutate({ id, payload: { rating: editRating, comment: editComment.trim() } });
    };

    const getTargetIcon = (type: string) => {
        switch (type) {
            case 'photographer': return <User size={14} />;
            case 'package': return <Package size={14} />;
            case 'rental': return <ShoppingBag size={14} />;
            default: return <Star size={14} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                
                <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => { setActiveTab('given'); setPage(1); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'given' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Send size={16} />
                        Reviews Given
                    </button>
                    <button
                        onClick={() => { setActiveTab('received'); setPage(1); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'received' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Inbox size={16} />
                        Reviews Received
                    </button>
                </div>

                <div className="relative group max-w-xs w-full">
                    <Star size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search items or comments..."
                        value={searchTerm}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearchTerm(val);
                            
                            const timeoutId = (window as unknown as { reviewSearchTimeout?: number }).reviewSearchTimeout;
                            if (timeoutId) clearTimeout(timeoutId);
                            (window as unknown as { reviewSearchTimeout: number }).reviewSearchTimeout = setTimeout(() => {
                                setDebouncedSearch(val);
                                setPage(1);
                            }, 500) as unknown as number;
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {isLoading ? "Loading reviews..." : `Total ${data?.total || 0} reviews ${activeTab}`}
                </h2>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: [activeTab === 'given' ? 'user-my-reviews' : 'user-received-reviews'] })}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center items-center">
                    <Loader2 className="animate-spin text-green-600" size={32} />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                    {activeTab === 'given' ? <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" /> : <Inbox size={48} className="mx-auto text-gray-300 mb-4" />}
                    <h3 className="text-lg font-bold text-gray-700">No reviews found</h3>
                    <p className="text-gray-500 text-sm">
                        {activeTab === 'given' ? "You haven't written any reviews yet." : "You haven't received any reviews yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {reviews.map((review) => (
                            <motion.div
                                key={review._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
                            >
                                {editingReview === review._id ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button key={star} onClick={() => setEditRating(star)}>
                                                        <Star
                                                            size={24}
                                                            className={star <= editRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">Editing review for {review.targetName}</p>
                                        </div>
                                        <textarea
                                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none min-h-[100px]"
                                            value={editComment}
                                            onChange={(e) => setEditComment(e.target.value)}
                                            placeholder="Share your experience..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSaveEdit(review._id)}
                                                disabled={updateMutation.isPending}
                                                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                            >
                                                {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="w-full md:w-1/4 flex flex-col items-center md:items-start text-center md:text-left gap-3 border-b md:border-b-0 md:border-r border-gray-50 pb-4 md:pb-0 md:pr-4">
                                            <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                                {activeTab === 'given' ? (
                                                    review.targetImage ? (
                                                        <img src={review.targetImage} alt={review.targetName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                                                            {getTargetIcon(review.type)}
                                                        </div>
                                                    )
                                                ) : (
                                                    review.reviewerId?.profileImage ? (
                                                        <img src={review.reviewerId.profileImage} alt={review.reviewerId.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                                                            <User size={24} />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-center md:justify-start gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
                                                    {activeTab === 'given' ? (
                                                        <>{getTargetIcon(review.type)} {review.type}</>
                                                    ) : (
                                                        <>{getTargetIcon(review.type)} for {review.targetName}</>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-gray-900 leading-tight line-clamp-2">
                                                    {activeTab === 'given' ? review.targetName : (review.reviewerId?.name || "Anonymous")}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] text-gray-400">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</p>
                                                    {review.edited && (
                                                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400 italic">
                                                            <Pencil size={8} />
                                                            Edited
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3 pt-2 md:pt-0">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={16}
                                                        className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{review.comment}</p>

                                            {review.ownerReply && (
                                                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 relative">
                                                    <div className="absolute -top-2 left-4 w-3 h-3 bg-gray-50 border-t border-l border-gray-100 rotate-45"></div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MessageSquare size={12} className="text-blue-500" />
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                            {activeTab === 'given' ? "Response from owner" : "Your response"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 italic">"{review.ownerReply.comment}"</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-2 justify-end md:justify-start opacity-0 group-hover:opacity-100 transition-opacity">
                                            {activeTab === 'given' && (
                                                <button
                                                    onClick={() => handleStartEdit(review)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Review"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
                                                        deleteMutation.mutate(review._id);
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Review"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-2 bg-white border rounded-lg flex items-center text-gray-600 font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};
