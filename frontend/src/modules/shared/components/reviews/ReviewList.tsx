import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../../../../services/api/reviewApi';
import type { Review, ReviewUpdatePayload } from '../../../../types/review';
import StarRating from './StarRating';
import { format } from 'date-fns';
import {
    User, Loader2, ChevronLeft, ChevronRight, ThumbsUp,
    MessageSquare, CornerDownRight, Send, Trash2, ShieldCheck, Pencil, X, Check
} from 'lucide-react';
import { useAuthStore } from '../../../auth/store/useAuthStore';
import { toast } from 'sonner';
import { getErrorMessage, type ApiError } from '../../../../utils/errorhandler';

interface ReviewListProps {
    targetId: string;
    isOwner?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ targetId, isOwner = false }) => {
    const [page, setPage] = useState(1);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const limit = 5;
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['reviews', targetId, page],
        queryFn: () => reviewApi.getReviews(targetId, page, limit),
        placeholderData: (previousData) => previousData
    });

    const likeMutation = useMutation({
        mutationFn: (reviewId: string) => reviewApi.toggleLikeReview(reviewId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', targetId] }),
        onError: () => toast.error("Failed to update like")
    });

    const replyMutation = useMutation({
        mutationFn: ({ reviewId, comment }: { reviewId: string; comment: string }) =>
            reviewApi.replyToReview(reviewId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', targetId] });
            setReplyingTo(null);
            setReplyText('');
            toast.success("Reply posted successfully");
        },
        onError: () => toast.error("Failed to post reply")
    });

    const deleteMutation = useMutation({
        mutationFn: (reviewId: string) => reviewApi.deleteReview(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', targetId] });
            queryClient.invalidateQueries({ queryKey: ['review-stats', targetId] });
            toast.success("Review deleted successfully");
        },
        onError: () => toast.error("Failed to delete review")
    });

    const updateMutation = useMutation({
        mutationFn: ({ reviewId, payload }: { reviewId: string; payload: ReviewUpdatePayload }) =>
            reviewApi.updateReview(reviewId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', targetId] });
            queryClient.invalidateQueries({ queryKey: ['review-stats', targetId] });
            setEditingId(null);
            toast.success("Review updated successfully");
        },
        onError: (err: ApiError) => toast.error(getErrorMessage(err))
    });

    const reviews: Review[] = React.useMemo(() => data?.reviews || [], [data]);

    const sortedReviews = React.useMemo(() => {
        if (!user?._id || reviews.length === 0) return reviews;
        return [...reviews].sort((a, b) => {
            const aIsUser = a.reviewerId?._id === user._id;
            const bIsUser = b.reviewerId?._id === user._id;
            if (aIsUser && !bIsUser) return -1;
            if (!aIsUser && bIsUser) return 1;
            return 0;
        });
    }, [reviews, user?._id]);

    const total = data?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const handleLike = (reviewId: string) => {
        if (!user) { toast.error("Please login to like reviews"); return; }
        likeMutation.mutate(reviewId);
    };

    const handleReplySubmit = (reviewId: string) => {
        if (!replyText.trim()) return;
        replyMutation.mutate({ reviewId, comment: replyText });
    };

    const startEdit = (review: Review) => {
        setEditingId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setReplyingTo(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditRating(0);
        setEditComment('');
    };

    const handleEditSubmit = (reviewId: string) => {
        if (editRating === 0) { toast.error("Please select a rating"); return; }
        if (editComment.trim().length < 10) { toast.error("Comment must be at least 10 characters"); return; }
        updateMutation.mutate({ reviewId, payload: { rating: editRating, comment: editComment.trim() } });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Reviews ({total})</h3>

            <div className="divide-y divide-gray-100">
                {sortedReviews.map((review: Review) => {
                    const hasLiked = user?._id && review.likes?.includes(user._id);
                    const isAuthor = user?._id === review.reviewerId?._id;
                    const isEditing = editingId === review._id;

                    return (
                        <div key={review._id} className="py-6 first:pt-0">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    {review.reviewerId?.profileImage ? (
                                        <img
                                            src={review.reviewerId.profileImage}
                                            alt={review.reviewerId.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    {/* Header row */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                {review.reviewerId?.name || 'Anonymous User'}
                                                {review.isVerified && (
                                                    <span
                                                        className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full border border-green-200"
                                                        title="Verified Purchase"
                                                    >
                                                        <ShieldCheck size={10} className="fill-green-700 text-green-100" />
                                                        Verified
                                                    </span>
                                                )}
                                                {isAuthor && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-semibold uppercase">
                                                        You
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-500">{format(new Date(review.createdAt), 'PPP')}</p>
                                                {review.edited && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400 italic">
                                                        <Pencil size={9} />
                                                        Edited
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!isEditing && <StarRating rating={review.rating} readonly size={16} />}
                                    </div>

                                    {isEditing ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                                                <StarRating rating={editRating} setRating={setEditRating} size={22} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Comment</label>
                                                <textarea
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px] bg-white"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditSubmit(review._id)}
                                                    disabled={updateMutation.isPending}
                                                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {updateMutation.isPending
                                                        ? <Loader2 size={13} className="animate-spin" />
                                                        : <Check size={13} />}
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                                >
                                                    <X size={13} />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-600 leading-relaxed text-sm mb-4">{review.comment}</p>

                                            <div className="flex items-center gap-4 flex-wrap mt-2">
                                                
                                                <button
                                                    onClick={() => handleLike(review._id)}
                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${hasLiked ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <ThumbsUp size={14} className={hasLiked ? 'fill-green-600' : ''} />
                                                    <span className="text-xs font-semibold">{review.likes?.length || 0}</span>
                                                </button>

                                                {/* Reply (owner only, once) */}
                                                {isOwner && !review.ownerReply && (
                                                    <button
                                                        onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                                                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                                    >
                                                        <MessageSquare size={14} />
                                                        <span className="text-xs font-semibold">Reply</span>
                                                    </button>
                                                )}

                                                <div className="flex-1"></div>

                                                {/* Edit (author only) */}
                                                {isAuthor && (
                                                    <button
                                                        onClick={() => startEdit(review)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
                                                        title="Edit Review"
                                                    >
                                                        <Pencil size={14} />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Edit</span>
                                                    </button>
                                                )}

                                                {/* Delete (author only) */}
                                                {isAuthor && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm("Are you sure you want to delete this review?")) {
                                                                deleteMutation.mutate(review._id);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                                                        title="Delete Review"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Owner reply display */}
                                    {review.ownerReply && !isEditing && (
                                        <div className="mt-4 ml-4 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500 relative">
                                            <CornerDownRight className="absolute -left-6 top-4 text-gray-300" size={20} />
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-green-700 uppercase">Owner's Reply</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {format(new Date(review.ownerReply.createdAt), 'PPP')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 italic">"{review.ownerReply.comment}"</p>
                                        </div>
                                    )}

                                    {replyingTo === review._id && !isEditing && (
                                        <div className="mt-4 flex gap-2">
                                            <input
                                                type="text"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write your reply..."
                                                className="flex-1 text-xs p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 outline-none"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleReplySubmit(review._id)}
                                                disabled={!replyText.trim() || replyMutation.isPending}
                                                className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                            >
                                                {replyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
