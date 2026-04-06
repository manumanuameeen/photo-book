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

const HomePage = () => {
  const [mixedItems, setMixedItems] = useState<HybridItem[]>([]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [equipmentRes, photographerRes] = await Promise.all([
            rentalApi.getAllItems('', 1, 5), // limit to 5
            userPhotographerApi.getPhotographers({ limit: 5 }) // limit to 5
        ]);

        const equipments = (equipmentRes.data?.items || []).map(item => ({ ...item, type: 'equipment' as const }));
        const photographers = (photographerRes.photographers || []).map((p: FeaturedPhotographer) => ({ ...p, type: 'photographer' as const }));

        // Interleave them: 1 eq, 1 photo, 1 eq, 1 photo...
        const combined: HybridItem[] = [];
        const maxLength = Math.max(equipments.length, photographers.length);
        for(let i=0; i<maxLength; i++) {
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

  return (
    <div className="relative min-h-screen bg-[#020202] text-gray-200 selection:bg-white/20 selection:text-white">
      <MouseFollower />
      
      {/* Global Antigravity Ambient Lighting */}
      <AmbientFlares />

      <div className="relative z-10 font-sans">
        <HeroParallax />

        {/* 1. Interleaved Hybrid Lineup with Native Parallax */}
        <FloatingHybridGallery items={mixedItems} />

        {/* 2. Integrated Cinematic Experience */}
        <Ecosystem />
      </div>
    </div>
  );
};

export default HomePage;
