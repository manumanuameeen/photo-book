import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ROUTES } from '../../../constants/routes';
import { Link } from '@tanstack/react-router';
import { MouseFollower } from '../../../components/common/MouseFollower';
import { MagneticButton } from '../../../components/common/MagneticButton';
import { TiltCard } from '../../../components/common/TiltCard';
import { HeroParallax } from '../../../components/home/HeroParallax';
import { userPhotographerApi } from '../../../services/api/userPhotographerApi';
const categories = [
  {
    icon: 'fas fa-ring',
    title: 'Wedding',
    subtitle: 'Capture your special day',
    bgImage: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    icon: 'fas fa-birthday-cake',
    title: 'Birthday',
    subtitle: 'Celebrate life moments',
    bgImage: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    icon: 'fas fa-briefcase',
    title: 'Corporate',
    subtitle: 'Professional photography',
    bgImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    icon: 'fas fa-mountain',
    title: 'Outdoor',
    subtitle: 'Nature & adventure shots',
    bgImage: 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
];


const stats = [
  { number: '500+', label: 'Professional Photographers' },
  { number: '20K+', label: 'Happy Clients' },
  { number: '4.9/5', label: 'Average Rating', accent: true },
];

const HomePage = () => {
  interface FeaturedPhotographer {
    _id?: string;
    id?: string;
    name?: string;
    image?: string;
    category?: string;
    rating?: number;
    reviews?: number;
  }
  const [featuredPhotographers, setFeaturedPhotographers] = useState<FeaturedPhotographer[]>([]);

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        const responseData = await userPhotographerApi.getPhotographers({ limit: 4 });
        setFeaturedPhotographers(responseData.photographers || []);
      } catch (error) {
        console.error("Failed to fetch featured photographers:", error);
      }
    };
    fetchPhotographers();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
      <MouseFollower />

      <HeroParallax />

      <section className="relative py-24 px-4 text-center overflow-hidden min-h-[500px]">

        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]"></div>

          {/* Noise overlay to match cinematic theme */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
        </div>

        <div className="relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-col items-center mb-12"
          >
            <p className="text-gray-500 font-mono text-xs tracking-[0.3em] mb-4">// EXPERTISE //</p>
            <h3 className="text-4xl font-light mb-4 text-white">
              Popular <span className="font-bold italic text-gray-400">Categories</span>
            </h3>
            <div className="w-12 h-[1px] bg-white/30"></div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {categories.map((cat) => (
              <TiltCard key={cat.title}>
                <motion.div
                  className="relative overflow-hidden rounded-xl shadow-2xl transition-all duration-300 group cursor-pointer h-48"
                  variants={fadeInUp}
                >

                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${cat.bgImage})`
                    }}
                  ></div>

                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:from-black/90 transition-all duration-300"
                  ></div>

                  <div className="relative z-10 h-full flex flex-col items-center justify-end p-6">
                    <div
                      className="w-10 h-10 rounded-none mb-3 flex items-center justify-center text-white text-lg border border-white/20 bg-black/50 backdrop-blur-sm"
                    >
                      <i className={cat.icon}></i>
                    </div>
                    <h4 className="font-mono tracking-widest text-sm mb-1 text-white uppercase">
                      {cat.title}
                    </h4>
                    <p className="text-gray-400 text-xs italic">{cat.subtitle}</p>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 text-center bg-[#111111] relative border-t border-white/5">
        <motion.div
          className="flex flex-col items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-500 font-mono text-xs tracking-[0.3em] mb-4">// TALENT //</p>
          <h3 className="text-4xl font-light mb-4 text-white">
            Featured <span className="font-bold italic text-gray-400">Artists</span>
          </h3>
          <div className="w-12 h-[1px] bg-white/30"></div>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {featuredPhotographers.map((p) => (
            <motion.div
              key={p._id}
              className="bg-[#0a0a0a] p-8 rounded-none border border-white/10 w-72 flex flex-col items-center transition-all duration-500 hover:border-white/30 group relative"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <div className="relative mb-6 w-full flex justify-center">
                <img
                  src={p.image || `https://ui-avatars.com/api/?name=${p.name?.replace(' ', '+') || 'P'}&size=200&background=111&color=fff`}
                  alt={p.name || 'Photographer'}
                  className="w-24 h-24 rounded-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${p.name?.replace(' ', '+') || 'P'}&size=200&background=111&color=fff`;
                  }}
                />
              </div>

              <h4 className="font-light text-xl mb-1 text-white tracking-wide truncate w-full text-center">
                {p.name || 'Photographer'}
              </h4>
              <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-4 truncate w-full text-center">{p.category || 'Photography'}</p>
              <div className="flex items-center text-xs font-mono mb-6 text-gray-400">
                <i className="fas fa-star mr-2 text-white/40"></i>
                {p.rating ? p.rating.toFixed(1) : 'New'}
                <span className="opacity-50 ml-2">({p.reviews || 0})</span>
              </div>
              <Link
                to={ROUTES.USER.PHOTOGRAPHER_DETAILS}
                params={{ id: p.id || p._id }}
                className="w-full"
              >
                <MagneticButton
                  className="px-8 py-3 text-xs font-mono tracking-[0.2em] uppercase rounded-none border border-white/20 text-white transition-all duration-300 hover:bg-white hover:text-black w-full flex justify-center items-center"
                >
                  <span className="relative z-10 text-center">View Profile</span>
                </MagneticButton>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-24 px-4 text-center bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] pointer-events-none rounded-full"></div>

        <motion.div
          className="flex flex-wrap justify-center gap-16 md:gap-32 max-w-5xl mx-auto relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center group cursor-default relative">
              <div className="absolute -left-6 top-2 text-[10px] text-gray-700 font-mono">0{i + 1} //</div>
              <motion.div
                className={`text-6xl md:text-7xl font-light mb-4 text-white font-serif tracking-tighter`}
              >
                {stat.number}
              </motion.div>
              <p className="text-gray-500 text-xs font-mono uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

    </div>
  );
};

export default HomePage;
