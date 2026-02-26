import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MagneticButton } from '../common/MagneticButton';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../constants/routes';

export const HeroParallax = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Gentle parallax effect for the beautiful background image
    const y = useTransform(scrollY, [0, 1000], [0, 300]);

    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        navigate({
            to: ROUTES.USER.PHOTOGRAPHER,
            search: { query: searchQuery }
        });
    };

    return (
        <div ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-green-950 pt-20 pb-12">

            {/* Parallax Background Landscape */}
            <motion.div
                className="absolute inset-[-20%] bg-cover bg-center"
                style={{
                    backgroundImage: "url('/images/premium_landscape.png')",
                    y: y
                }}
            />

            {/* Rich Gradient Overlays for Brand matching and text readability */}
            <div className="absolute inset-0 bg-green-950/50 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-950/60 to-green-950"></div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center text-center mt-6">

                {/* floating badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wide uppercase mb-8 shadow-lg"
                >
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                    Premium Photography Platform
                </motion.div>

                {/* Hero Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1] drop-shadow-xl"
                >
                    Capture <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500">Perfect</span> <br className="hidden md:block" /> Moments
                </motion.h1>

                {/* Hero Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl font-light drop-shadow-md"
                >
                    Connect with acclaimed professional photographers for weddings, events, and special occasions. Experience luxury service and stunning results.
                </motion.p>

                {/* Premium Glassmorphism Single Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-3 rounded-full shadow-2xl border border-white/20 flex items-center pr-3"
                >
                    <div className="flex-1 px-6 py-2 flex items-center gap-4">
                        <i className="fas fa-search text-gray-300 text-xl"></i>
                        <input
                            type="text"
                            placeholder="Try 'Wedding Photographer in New York'..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-transparent border-none text-white text-lg focus:ring-0 outline-none p-0 placeholder-gray-400 font-medium"
                        />
                    </div>

                    {/* Submit Button */}
                    <MagneticButton
                        onClick={handleSearch}
                        className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-green-950 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 flex items-center shrink-0"
                    >
                        <span className="flex items-center text-lg tracking-wide">
                            Search
                        </span>
                    </MagneticButton>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-14 flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm md:text-base text-gray-300 bg-black/20 backdrop-blur-sm px-8 py-3 rounded-full border border-white/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full border-2 border-green-900 object-cover" alt="User" />
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full border-2 border-green-900 object-cover" alt="User" />
                            <img src="https://randomuser.me/api/portraits/women/68.jpg" className="w-10 h-10 rounded-full border-2 border-green-900 object-cover" alt="User" />
                        </div>
                        <span className="font-medium text-white shadow-sm">+20K Happy Clients</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        <div className="flex text-yellow-500">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                        </div>
                        <span className="font-medium text-white shadow-sm">4.9/5 Average Rating</span>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};
