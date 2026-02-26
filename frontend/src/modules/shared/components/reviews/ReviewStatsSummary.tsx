import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Loader2 } from 'lucide-react';
import { reviewApi } from '../../../../services/api/reviewApi';

interface ReviewStatsSummaryProps {
    targetId: string;
    className?: string;
}

const ReviewStatsSummary: React.FC<ReviewStatsSummaryProps> = ({ targetId, className = "" }) => {
    const { data, isLoading } = useQuery({
        queryKey: ['review-stats', targetId],
        queryFn: () => reviewApi.getStats(targetId),
        staleTime: 1000 * 60 * 5, 
    });

    if (isLoading) {
        return (
            <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Loading ratings...</span>
            </div>
        );
    }

    const average = data?.average || 0;
    const count = data?.count || 0;

    return (
        <div className={`flex items-center ${className}`}>
            <Star size={16} className={`${average > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} mr-1`} />
            <span className="font-bold text-gray-700 mr-1">{average > 0 ? average.toFixed(1) : 'No'}</span>
            <span className="text-gray-500">({count} {count === 1 ? 'review' : 'reviews'})</span>
        </div>
    );
};

export default ReviewStatsSummary;
