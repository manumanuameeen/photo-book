import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '../../constants/routes';
import { MagneticButton } from '../common/MagneticButton';
import type { IRentalItem } from '../../types/rental';

interface FloatingEquipmentProps {
  equipment: IRentalItem[];
}

const EquipmentCard = ({ item, yOffset }: { item: IRentalItem, yOffset: MotionValue<number> }) => {
    // Take the absolute path from the backend
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : `https://ui-avatars.com/api/?name=${item.name.replace(' ', '+')}&size=400&background=111&color=fff`;

    return (
        <motion.div 
            style={{ y: yOffset }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative w-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer will-change-transform"
        >
            <div className="aspect-[4/5] w-full overflow-hidden">
                <motion.img 
                    src={imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter brightness-90 group-hover:brightness-110"
                />
                
                {/* Gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
                    <p className="text-gray-300 font-mono text-[10px] tracking-[0.2em] uppercase mb-2 bg-black/40 inline-block px-2 py-1 rounded w-max backdrop-blur-md">
                        {item.category}
                    </p>
                    <h4 className="text-white text-xl md:text-2xl font-light leading-tight mb-2">
                        {item.name}
                    </h4>
                    <div className="flex justify-between items-end">
                        <p className="text-white font-mono text-sm">
                            <span className="opacity-50">₹</span>{item.pricePerDay} <span className="text-[10px] uppercase tracking-widest opacity-50">/ day</span>
                        </p>
                    </div>
                </div>
            </div>
            
            <Link to={ROUTES.USER.RENTAL_MARKETPLACE} search={{ category: item.category }} className="absolute inset-0 z-10"></Link>
        </motion.div>
    );
};

export const FloatingEquipment = ({ equipment }: FloatingEquipmentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply Apple-style scroll smoothing physics
  const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
      stiffness: 80,
      damping: 25,
      restDelta: 0.001
  });

  // Calculate extreme parallax offsets for different columns
  const yOffsetFast = useTransform(smoothProgress, [0, 1], [150, -300]);
  const yOffsetMedium = useTransform(smoothProgress, [0, 1], [50, -100]);
  const yOffsetSlow = useTransform(smoothProgress, [0, 1], [-50, 150]);

  // Split equipment into three columns naturally
  const columns = useMemo(() => {
      const cols: IRentalItem[][] = [[], [], []];
      equipment.forEach((item, i) => cols[i % 3].push(item));
      return cols;
  }, [equipment]);

  if (!equipment || equipment.length === 0) return null;

  return (
    <section ref={containerRef} className="relative py-32 px-4 bg-[#020202] overflow-hidden">
        {/* Header content */}
        <div className="max-w-7xl mx-auto flex flex-col items-center mb-24 relative z-20 text-center">
            <p className="text-gray-400 font-mono text-xs tracking-[0.3em] mb-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full inline-block backdrop-blur-sm">// EQUIPMENT VAULT //</p>
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight drop-shadow-2xl">
                Industry Standard
                <span className="block font-bold italic text-white/50 mt-2">Gear Lineup</span>
            </h3>
        </div>

        {/* Floating Lineup Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 relative perspective-[1000px]">
            {columns.map((columnItems, colIndex) => {
                // Assign a scroll mapping speed to the column based on index
                const offset = colIndex === 0 ? yOffsetFast : colIndex === 1 ? yOffsetSlow : yOffsetMedium;
                
                return (
                    <div key={colIndex} className={`flex flex-col gap-8 md:gap-12 ${colIndex === 1 ? 'md:mt-32' : ''} ${colIndex === 2 ? 'md:-mt-16 hidden lg:flex' : ''}`}>
                        {columnItems.map((item, itemIndex) => (
                            <EquipmentCard 
                                key={item._id || itemIndex} 
                                item={item} 
                                yOffset={offset} 
                            />
                        ))}
                    </div>
                );
            })}
        </div>
        
        {/* Call to action at the bottom */}
        <div className="max-w-7xl mx-auto mt-32 flex justify-center relative z-20 py-20 border-t border-white/5">
            <Link to={ROUTES.USER.RENTAL_MARKETPLACE}>
                <MagneticButton className="px-8 py-4 bg-white text-black font-mono text-xs tracking-[0.2em] rounded-full hover:bg-gray-200 transition-colors">
                    BROWSE INVENTORY
                </MagneticButton>
            </Link>
        </div>
        
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
    </section>
  );
};
