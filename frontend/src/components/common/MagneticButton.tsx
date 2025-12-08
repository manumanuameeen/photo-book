import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const MagneticButton = ({ children, className = "", onClick, style }: MagneticButtonProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();
        const xOffset = clientX - (left + width / 2);
        const yOffset = clientY - (top + height / 2);
        x.set(xOffset);
        y.set(yOffset);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ x: mouseX, y: mouseY, ...style }}
            className={`relative cursor-pointer ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Sheen effect container */}
            <motion.div
                className="absolute inset-0 overflow-hidden rounded-md pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
            >
                <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </motion.div>
            {children}
        </motion.div>
    );
};
