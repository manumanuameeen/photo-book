import { useState, useEffect } from 'react';
import { MouseFollower } from '../../../components/common/MouseFollower';
import { HeroParallax } from '../../../components/home/HeroParallax';
import { rentalApi } from '../../../services/api/rentalApi';
import { userPhotographerApi } from '../../../services/api/userPhotographerApi';

import { AmbientFlares } from '../../../components/home/AmbientFlares';
import { FloatingHybridGallery } from '../../../components/home/FloatingHybridGallery';
import { Ecosystem } from '../../../components/home/Ecosystem';

export interface FeaturedEquipment {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  pricePerDay: number;
  images?: string[];
  type?: 'equipment';
}

export interface FeaturedPhotographer {
  _id?: string;
  id?: string;
  name?: string;
  image?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  type?: 'photographer';
}

export type HybridItem = FeaturedPhotographer | FeaturedEquipment;

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const HomePage = () => {
  const [mixedItems, setMixedItems] = useState<HybridItem[]>([]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [equipmentRes, photographerRes] = await Promise.all([
          rentalApi.getAllItems('', 1, 5),
          userPhotographerApi.getPhotographers({ limit: 5 })
        ]);

        const equipments = (equipmentRes.data?.items || []).map(item => ({ ...item, type: 'equipment' as const }));
        const photographers = (photographerRes.photographers || []).map((p: FeaturedPhotographer) => ({ ...p, type: 'photographer' as const }));

        const combined: HybridItem[] = [];
        const maxLength = Math.max(equipments.length, photographers.length);
        for (let i = 0; i < maxLength; i++) {
          if (equipments[i]) combined.push(equipments[i]);
          if (photographers[i]) combined.push(photographers[i]);
        }

        setMixedItems(combined);
      } catch (error) {
        console.error("Failed to fetch featured entities:", error);
      }
    };
    fetchEntities();
  }, []);

  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const, 
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#020202] text-gray-200 selection:bg-white/20 selection:text-white">
      <MouseFollower />
      <AmbientFlares />

      <motion.div
        className="relative z-10 font-sans"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <HeroParallax />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FloatingHybridGallery items={mixedItems} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Ecosystem />
        </motion.div>
      </motion.div>

      <script src="https://api.anvevoice.app/functions/v1/voice-assistant-embed-js?embedId=f6f9fd77-4f3d-4b38-8ef4-ca1136340484&position=bottom-right&theme=light"></script>
    </div>
  );
};

export default HomePage;
