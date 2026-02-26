import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    setRating?: (rating: number) => void;
    readonly?: boolean;
    size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, readonly = false, size = 20 }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-200`}
                    onClick={() => !readonly && setRating && setRating(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    disabled={readonly}
                >
                    <Star
                        size={size}
                        className={`${star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
