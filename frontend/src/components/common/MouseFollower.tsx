import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

export const MouseFollower = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const [isClicking, setIsClicking] = useState(false);

    // Very smooth "fluid" spring config
    const springConfig = { damping: 25, stiffness: 120, mass: 0.8 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <>
            {/* Main trailing ring - interacts with clicks */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-yellow-500 pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isClicking ? 0.8 : 1,
                    borderWidth: isClicking ? "4px" : "1px"
                }}
            />
            {/* Small dot - sharp and precise */}
            <motion.div
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-yellow-500 rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />
        </>
    );
};
