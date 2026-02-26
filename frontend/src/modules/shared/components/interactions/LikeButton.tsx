import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { likeApi } from '../../../../services/api/likeApi';
import type { LikeTargetType } from '../../../../services/api/likeApi';
import { useAuthStore } from '../../../auth/store/useAuthStore';
import { toast } from 'sonner';

interface LikeButtonProps {
    targetId: string;
    targetType: LikeTargetType;
    initialLikes?: string[];
    className?: string;
    showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
    targetId,
    targetType,
    initialLikes = [],
    className = "",
    showCount = true
}) => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const isLiked = user?._id ? initialLikes.includes(user._id) : false;

    const likeMutation = useMutation({
        mutationFn: () => likeApi.toggleLike(targetId, targetType),
        onSuccess: () => {
            
            const queryKeysMap: Record<LikeTargetType, string[]> = {
                photographer: ['photographer', targetId],
                package: ['packages', targetId],
                portfolio: ['portfolio', targetId],
                rental: ['rental', targetId]
            };
            queryClient.invalidateQueries({ queryKey: queryKeysMap[targetType] });
        },
        onError: () => toast.error("Failed to update like status")
    });

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please login to like this item");
            return;
        }
        likeMutation.mutate();
    };

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center gap-1.5 transition-all duration-200 hover:scale-110 active:scale-95 ${className}`}
            title={isLiked ? "Unlike" : "Like"}
        >
            <Heart
                size={20}
                className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
            />
            {showCount && (
                <span className={`text-sm font-medium ${isLiked ? 'text-red-600' : 'text-gray-500'}`}>
                    {initialLikes.length}
                </span>
            )}
        </button>
    );
};

export default LikeButton;
