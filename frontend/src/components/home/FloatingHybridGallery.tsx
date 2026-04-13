import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '../../constants/routes';
import { MagneticButton } from '../common/MagneticButton';
import type { HybridItem, FeaturedEquipment, FeaturedPhotographer } from '../../modules/user/pages/Home';

const ShortEquipmentCard = ({ item, yOffset }: { item: FeaturedEquipment, yOffset: MotionValue<number> }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : `https://ui-avatars.com/api/?name=${item.name.replace(' ', '+')}&size=400&background=111&color=fff`;

    return (
        <motion.div 
            style={{ y: yOffset }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative w-64 md:w-72 h-[340px] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] cursor-pointer will-change-transform flex-shrink-0"
        >
            <div className="absolute inset-0 w-full h-full">
                <motion.img 
                    src={imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter brightness-[0.8] group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 w-full p-5 flex flex-col justify-end">
                <p className="text-gray-300 font-mono text-[9px] tracking-[0.2em] uppercase mb-1.5 bg-white/10 backdrop-blur-md inline-block px-2 py-0.5 rounded w-max border border-white/10">
                    GEAR / {item.category}
                </p>
                <h4 className="text-white text-lg font-medium leading-tight mb-1 drop-shadow-md">
                    {item.name}
                </h4>
                <p className="text-gray-300 font-mono text-xs drop-shadow-md">
                    ₹{item.pricePerDay} <span className="opacity-50 text-[9px]">/ DAY</span>
                </p>
            </div>
            <Link to={ROUTES.USER.RENTAL_DETAILS} params={{ id: item.id || item._id as string }} className="absolute inset-0 z-10"></Link>
        </motion.div>
    );
};

const ShortPhotographerCard = ({ item, yOffset }: { item: FeaturedPhotographer, yOffset: MotionValue<number> }) => {
    const imageUrl = item.image || `https://ui-avatars.com/api/?name=${item.name?.replace(' ', '+')}&size=400&background=111&color=fff`;

    return (
        <motion.div 
            style={{ y: yOffset }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative w-64 md:w-72 h-[340px] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] cursor-pointer flex-shrink-0 flex flex-col items-center justify-center p-6 will-change-transform"
        >
            <div className="absolute inset-0 w-full h-full">
                <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-opacity duration-700 blur border-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#020202]/80 to-[#020202]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border border-white/20 shadow-xl">
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                
                <p className="text-gray-300 font-mono text-[9px] tracking-[0.2em] uppercase mb-2 bg-white/10 backdrop-blur-md inline-block px-2 py-0.5 rounded border border-white/10">
                    VISIONARY
                </p>
                <h4 className="text-white text-lg font-medium leading-tight mb-1 text-center drop-shadow-md">
                    {item.name}
                </h4>
                <div className="flex items-center text-[10px] font-mono text-gray-400 mt-2">
                    <i className="fas fa-star text-yellow-500 mr-1.5"></i>
                    {item.rating ? item.rating.toFixed(1) : 'NEW'} 
                    <span className="opacity-50 ml-1">({item.reviews || 0})</span>
                </div>
            </div>
            
            <Link to={ROUTES.USER.PHOTOGRAPHER_DETAILS} params={{ id: item.id || item._id as string }} className="absolute inset-0 z-10"></Link>
        </motion.div>
    );
};

export const FloatingHybridGallery = ({ items }: { items: HybridItem[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
      stiffness: 70,
      damping: 25,
      restDelta: 0.001
  });

  
  const yOffsetLeft = useTransform(smoothProgress, [0, 1], [150, -350]);
  const yOffsetMiddle = useTransform(smoothProgress, [0, 1], [-200, 200]); 
  const yOffsetRight = useTransform(smoothProgress, [0, 1], [250, -450]);

  const columns = useMemo(() => {
      const cols: HybridItem[][] = [[], [], []];
      items.forEach((item, i) => cols[i % 3].push(item));
      return cols;
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <section ref={containerRef} className="relative py-32 md:py-40 px-4 bg-[#020202] overflow-hidden">
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-32 relative z-20">
            <div>
                <p className="text-gray-400 font-mono text-xs tracking-[0.3em] mb-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full inline-block backdrop-blur-sm">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight drop-shadow-2xl max-w-xl">
                    Discover Top Tier
                    <span className="block font-bold italic text-white/50 mt-2">Talent & Gear</span>
                </h3>
            </div>
            <div className="mt-8 md:mt-0 flex gap-4">
                <Link to={ROUTES.USER.PHOTOGRAPHER}>
                    <MagneticButton className="px-6 py-3 bg-white/10 text-white font-mono text-[10px] tracking-[0.2em] rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors">
                        ALL VISIONARIES
                    </MagneticButton>
                </Link>
            </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center gap-8 md:gap-14 relative perspective-[1000px] h-auto lg:h-[1200px] items-start">
            {columns.map((columnItems, colIndex) => {
                const offset = colIndex === 0 ? yOffsetLeft : colIndex === 1 ? yOffsetMiddle : yOffsetRight;
                return (
                    <div key={colIndex} className={`flex flex-col gap-8 md:gap-14 ${colIndex === 1 ? 'md:mt-48' : ''} ${colIndex === 2 ? 'md:mt-12' : ''}`}>
                        {columnItems.map((item, itemIndex) => {
                            if (item.type === 'equipment') {
                                return <ShortEquipmentCard key={item._id || itemIndex} item={item as FeaturedEquipment} yOffset={offset} />;
                            } else {
                                return <ShortPhotographerCard key={item._id || itemIndex} item={item as FeaturedPhotographer} yOffset={offset} />;
                            }
                        })}
                    </div>
                );
            })}
        </div>
        
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </section>
  );
};
