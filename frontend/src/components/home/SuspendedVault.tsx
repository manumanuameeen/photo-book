import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { MagneticButton } from '../common/MagneticButton';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '../../constants/routes';

const hardwareGear = [
  {
    id: 1,
    name: "Sony Alpha a7S III",
    category: "Camera Body",
    price: "$85/day",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    specs: ["4K 120p", "15+ Stops Range", "12.1MP Exmor R"],
    initialPosition: { x: -50, y: -20 },
    scrollShift: { x: -100, y: -50 },
  },
  {
    id: 2,
    name: "DJI Mavic 3 Pro",
    category: "Drone",
    price: "$120/day",
    image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800",
    specs: ["Tri-Camera System", "43 Min Flight", "5.1K Video"],
    initialPosition: { x: 50, y: 30 },
    scrollShift: { x: 120, y: 80 },
  },
  {
    id: 3,
    name: "G Master 24-70mm",
    category: "Lens",
    price: "$45/day",
    image: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800",
    specs: ["Sony E-Mount", "f/2.8 Constant", "Nano AR Coating"],
    initialPosition: { x: 0, y: 60 },
    scrollShift: { x: 0, y: 150 },
  }
];

interface Gear {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  specs: string[];
  initialPosition: { x: number; y: number };
  scrollShift: { x: number; y: number };
}

const GearItem = ({ gear, i, smoothProgress }: { gear: Gear, i: number, smoothProgress: MotionValue<number> }) => {
  const shiftX = useTransform(
    smoothProgress, 
    [0, 1], 
    [gear.initialPosition.x, gear.initialPosition.x + gear.scrollShift.x]
  );
  const shiftY = useTransform(
    smoothProgress, 
    [0, 1], 
    [gear.initialPosition.y, gear.initialPosition.y + gear.scrollShift.y]
  );

  const driftY = [-5, 5, -5];
  
  return (
    <motion.div
      style={{ x: shiftX, y: shiftY, zIndex: 10 - i }}
      className={`absolute will-change-transform flex flex-col items-center ${
        i === 0 ? 'left-0 md:left-[10%] top-0' : 
        i === 1 ? 'right-0 md:right-[10%] top-[20%]' : 
        'bottom-0'
      }`}
    >
      <motion.div
        animate={{ y: driftY }}
        transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut" }}
        className="w-48 h-48 md:w-64 md:h-64 mb-[-80px] md:mb-[-100px] relative z-0 pointer-events-none rounded-full overflow-hidden opacity-30 blur-sm shadow-2xl mix-blend-screen"
      >
        <img src={gear.image} alt={gear.name} className="w-full h-full object-cover filter grayscale" />
      </motion.div>

      <motion.div
        animate={{ y: driftY.map(val => val * 1.5) }} 
        transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-64 md:w-80 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">{gear.category}</p>
            <h4 className="text-lg text-white font-medium">{gear.name}</h4>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white">{gear.price}</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          {gear.specs.map((spec: string) => (
            <div key={spec} className="flex items-center text-xs text-gray-400 font-mono">
              <span className="w-1 h-1 bg-white/30 rounded-full mr-2"></span>
              {spec}
            </div>
          ))}
        </div>

        <Link to={ROUTES.USER.RENTAL_MARKETPLACE} className="block w-full">
          <MagneticButton className="w-full py-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white font-mono uppercase tracking-[0.1em] hover:bg-white hover:text-black transition-all duration-300">
            Rent Now
          </MagneticButton>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export const SuspendedVault = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const bgRotation = useTransform(smoothProgress, [0, 1], [-2, 2]);

  return (
    <section ref={containerRef} className="relative py-32 min-h-[150vh] flex items-center justify-center overflow-hidden">
      
      <motion.div 
        style={{ rotate: bgRotation }}
        className="absolute inset-0 z-0 pointer-events-none opacity-20 will-change-transform"
      >
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full h-full flex flex-col items-center">
        
        <div className="text-center mb-40 relative">
          <p className="text-gray-500 font-mono text-xs tracking-[0.3em] mb-4">// SUSPENDED VAULT //</p>
          <h3 className="text-5xl md:text-7xl font-light text-white leading-tight">
            Professional Equipment
            <span className="block font-bold italic text-gray-400 mt-2">Marketplace</span>
          </h3>
        </div>

        <div className="relative w-full h-[600px] flex justify-center items-center perspective-[2000px]">
          {hardwareGear.map((gear, i) => (
            <GearItem key={gear.id} gear={gear} i={i} smoothProgress={smoothProgress} />
          ))}
        </div>
      </div>
    </section>
  );
};
