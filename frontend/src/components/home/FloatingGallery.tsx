import { useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '../../constants/routes';
import { MagneticButton } from '../common/MagneticButton';
import { ScrambleText } from '../common/ScrambleText';

interface Photographer {
  _id?: string;
  id?: string;
  name?: string;
  image?: string;
  category?: string;
  rating?: number;
  reviews?: number;
}

interface FloatingGalleryProps {
  photographers: Photographer[];
}

const TiltCard = ({ 
  photographer, 
  index, 
  hoveredId, 
  setHoveredId 
}: { 
  photographer: Photographer; 
  index: number; 
  hoveredId: string | null; 
  setHoveredId: (id: string | null) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHoveredId(null);
  };

  const pId = photographer.id || photographer._id || index.toString();
  const isHovered = hoveredId === pId;
  const isAnotherHovered = hoveredId !== null && hoveredId !== pId;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHoveredId(pId)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
       className={`relative rounded-2xl w-72 md:w-80 h-[450px] p-6 flex flex-col items-center justify-between transition-all duration-[600ms] cubic-bezier(0.25, 1, 0.5, 1) will-change-transform ${
        isHovered ? 'z-50 scale-105 shadow-[0_0_80px_rgba(255,255,255,0.1)]' : 'z-10'
      } ${
        isAnotherHovered ? 'blur-md opacity-40 scale-95' : 'opacity-100'
      }`}
    >
      {}
      <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-none" style={{ transform: "translateZ(0px)" }}></div>
      
      <div className="relative z-10 w-full flex flex-col items-center" style={{ transform: "translateZ(50px)" }}>
        <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
          <img
            src={photographer.image || `https://ui-avatars.com/api/?name=${photographer.name?.replace(' ', '+') || 'P'}&size=200&background=111&color=fff`}
            alt={photographer.name || 'Photographer'}
            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
          />
        </div>
        <h4 className="font-light text-2xl mb-1 text-white tracking-wide text-center">
          {photographer.name || 'Photographer'}
        </h4>
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4 text-center">
          {photographer.category || 'Photography'}
        </p>
        
        <div className="flex items-center text-sm font-mono mb-6 text-gray-300 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
          <i className="fas fa-star mr-2 text-yellow-500/80"></i>
          {photographer.rating ? photographer.rating.toFixed(1) : 'New'}
          <span className="opacity-50 ml-2">({photographer.reviews || 0})</span>
        </div>
      </div>

      <div className="relative w-full z-10" style={{ transform: "translateZ(40px)" }}>
        <Link
          to={ROUTES.USER.PHOTOGRAPHER_DETAILS}
          params={{ id: pId }}
          className="w-full block"
        >
          <MagneticButton
            className="w-full py-4 text-xs font-mono tracking-[0.2em] uppercase rounded-xl border border-white/20 bg-white/5 text-white transition-all duration-300 hover:bg-white hover:text-black flex justify-center items-center backdrop-blur-md"
          >
            <span>View Visionary</span>
          </MagneticButton>
        </Link>
      </div>
    </motion.div>
  );
};

export const FloatingGallery = ({ photographers }: FloatingGalleryProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  
  const driftOffsets = [0, 2, 4, 1, 3, 5, 2];

  return (
    <section className="relative py-32 px-4 bg-transparent perspective-[2000px]">
      <div className="max-w-7xl mx-auto flex flex-col items-center mb-24 relative z-20">
        <p className="text-gray-500 font-mono text-xs tracking-[0.3em] mb-4">
        <h3 className="text-5xl md:text-7xl font-light text-white text-center leading-tight">
          <ScrambleText text="Discover World-Class" className="block" />
          <span className="font-bold italic text-gray-400 block mt-2">
            <ScrambleText text="Visionaries" />
          </span>
        </h3>
      </div>

      <div className="max-w-7xl mx-auto relative flex flex-wrap justify-center gap-12 gap-y-24 md:gap-y-32 perspective-[1000px]">
        {photographers.map((p, i) => (
          <motion.div
            key={p.id || p._id || i}
            animate={{
              y: [-15, 15, -15],
            }}
            transition={{
              duration: 6 + (driftOffsets[i % driftOffsets.length] || 0),
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`will-change-transform mt-${i % 2 === 0 ? '0' : '16 md:24'}`}
          >
            <TiltCard 
              photographer={p} 
              index={i} 
              hoveredId={hoveredId} 
              setHoveredId={setHoveredId} 
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
