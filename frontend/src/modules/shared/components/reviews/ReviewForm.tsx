import React, { useState } from 'react';
import StarRating from './StarRating';
import { toast } from 'sonner';
import { reviewApi } from '../../../../services/api/reviewApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { getErrorMessage, type ApiError } from '../../../../utils/errorhandler';

interface ReviewFormProps {
    targetId: string;
    type: 'photographer' | 'rental' | 'package' | 'user';
    onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ targetId, type, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: () => reviewApi.addReview(targetId, type, rating, comment),
        onSuccess: () => {
            toast.success('Review submitted successfully!');
            setRating(0);
            setComment('');
            queryClient.invalidateQueries({ queryKey: ['reviews', targetId] });
            queryClient.invalidateQueries({ queryKey: ['review-stats', targetId] });
            if (onSuccess) onSuccess();
        },
        onError: (err: ApiError) => {
            toast.error(getErrorMessage(err));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!comment.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }
        mutate();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                    <StarRating rating={rating} setRating={setRating} size={24} />
                    <span className="text-sm text-gray-400 font-medium ml-2">
                        {rating > 0 ? `${rating} out of 5` : 'Select stars'}
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all min-h-[100px]"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Submitting...
                    </>
                ) : (
                    'Submit Review'
                )}
            </button>
        </form>
    );
};

export default ReviewForm;
