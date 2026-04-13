import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rentalApi } from '../../../services/api/rentalApi';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';
import { Search, Filter, Package, ChevronLeft, ChevronRight, Plus, MessageCircle,ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../../modules/auth/store/useAuthStore';
import PageTransition from '../../../components/common/PageTransition';
import { AnimatePresence, motion } from 'framer-motion';
import type { IRentalItem, IUserProfile } from '../../../types/rental';
import { MagneticButton } from '../../../components/common/MagneticButton';

export default function RentalMarketplace() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [category, setCategory] = useState<string>('');
    const [condition, setCondition] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [page, setPage] = useState(1);
    const LIMIT = 8;

    const { data, isLoading } = useQuery({
        queryKey: ['rental-items', category, page],
        queryFn: () => rentalApi.getAllItems(category || undefined, page, LIMIT),
        placeholderData: (previousData) => previousData
    });

    const items = data?.data?.items || [];
    const totalItems = data?.data?.total || 0;
    const totalPages = Math.ceil(totalItems / LIMIT);

    const filteredItems = items.filter((item: IRentalItem) =>
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!condition || item.condition === condition) &&
        (!user?._id || String(typeof item.ownerId === 'string' ? item.ownerId : (item.ownerId as IUserProfile)._id) !== String(user._id))
    );

    const categories = [
        "Cameras", "Lenses", "Lighting", "Drones", "Audio",
        "Tripods & Supports", "Bags & Cases", "Studio Gear",
        "Computers & Monitors", "Accessories", "Others"
    ];

    const conditions = ["Excellent", "Good", "Fair", "Poor"];

    return (
        <PageTransition>
            <div className="min-h-screen bg-green-950 font-sans text-gray-200 pb-20 relative">
                {}
                <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>

                <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-center z-10 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-7xl mx-auto flex flex-col items-center"
                    >
                        <p className="text-yellow-500 font-mono text-xs tracking-[0.3em] mb-4">
                        <h1 className="text-5xl md:text-7xl font-light text-white mb-6">
                            Rent Pro <br />
                            <span className="font-bold italic text-yellow-400">Equipment</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base font-light max-w-2xl mb-10">
                            Access high-quality photography and videography gear for your next cinematic project without the high upfront cost.
                        </p>
                        <MagneticButton
                            onClick={() => navigate({ to: ROUTES.USER.RENT_ITEM })}
                            className="bg-yellow-500 hover:bg-yellow-400 text-green-950 px-8 py-4 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2 mb-4 shrink-0"
                        >
                            <Plus size={20} />
                            List Your Gear
                        </MagneticButton>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                    {}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-3 shadow-2xl mb-12 flex flex-col"
                    >
                        <div className="flex flex-col md:flex-row items-center w-full">
                            <div className="flex-grow w-full relative flex items-center bg-white/5 rounded-full px-6 py-4 md:mr-2 mb-2 md:mb-0">
                                <Search className="text-gray-400" size={24} />
                                <input
                                    type="text"
                                    placeholder="Search 'Sony A7S III', 'DJI Mavic'..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-4 bg-transparent border-none text-white focus:ring-0 outline-none placeholder-gray-500 text-lg"
                                />
                            </div>

                            <div className="hidden md:block w-px h-12 bg-white/10 mx-2"></div>

                            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1 min-w-[180px] group bg-white/5 rounded-full px-5 py-4">
                                    <select
                                        value={category}
                                        onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                                        className="w-full appearance-none bg-transparent border-none text-gray-300 focus:outline-none focus:ring-0 cursor-pointer pr-10 [&>option]:text-gray-900 text-base"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <Filter className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-yellow-500 transition-colors" size={18} />
                                </div>

                                <div className="hidden sm:block w-px h-10 bg-white/10 self-center mx-1"></div>

                                <div className="relative flex-1 min-w-[160px] group bg-white/5 rounded-full px-5 py-4">
                                    <select
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                        className="w-full appearance-none bg-transparent border-none text-gray-300 focus:outline-none focus:ring-0 cursor-pointer pr-10 [&>option]:text-gray-900 text-base"
                                    >
                                        <option value="">Any Condition</option>
                                        {conditions.map((cond) => (
                                            <option key={cond} value={cond}>{cond}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-yellow-500 transition-colors" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-6 pt-4 pb-2">
                            <div className="flex items-center gap-4">
                                {(category || condition) && (
                                    <button
                                        onClick={() => { setCategory(''); setCondition(''); setPage(1); }}
                                        className="text-xs font-mono tracking-widest text-red-400 hover:text-red-300 transition-colors uppercase"
                                    >
                                        [ Clear Config ]
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => navigate({ to: '/main/rules' })}
                                className="flex items-center text-xs text-gray-400 hover:text-white font-medium transition-colors"
                            >
                                <span className="mr-2">⚠️</span> Platform Guidelines
                            </button>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <div key={n} className="bg-white/5 backdrop-blur-sm rounded-[2rem] h-96 animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <>
                            <div className="mb-6 text-gray-400 font-mono text-xs uppercase tracking-widest text-left ml-4">
                                [ {totalItems} Items Available ]
                            </div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredItems.map((item: IRentalItem) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.4 }}
                                            key={item._id}
                                            onClick={() => navigate({ to: ROUTES.USER.RENTAL_DETAILS, params: { id: item._id } })}
                                            className="group bg-[#0a0a0a]/60 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full border border-white/5 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="aspect-[4/3] bg-[#111] relative overflow-hidden">
                                                {item.images?.[0] ? (
                                                    <img
                                                        src={item.images[0]}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <Package size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-white border border-white/20">
                                                    {item.condition}
                                                </div>
                                            </div>

                                            <div className="p-6 flex flex-col flex-1 relative">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[10px] font-mono tracking-widest text-yellow-500 uppercase">
                                                        {item.category}
                                                    </span>
                                                </div>

                                                <h3 className="font-light text-xl text-white mb-2 line-clamp-1 group-hover:text-yellow-400 transition-colors">
                                                    {item.name}
                                                </h3>



                                                <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
                                                    <div>
                                                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Rate</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-2xl font-light text-white">${item.pricePerDay}</span>
                                                            <span className="text-xs text-gray-500 font-mono">/day</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const ownerId = typeof item.ownerId === 'string' ? item.ownerId : item.ownerId._id;
                                                                navigate({ to: '/chat', search: { userId: ownerId } });
                                                            }}
                                                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                                                            title="Hail Owner"
                                                        >
                                                            <MessageCircle size={18} />
                                                        </button>
                                                        <button className="p-3 bg-yellow-500 text-green-950 rounded-xl transition-all shadow-lg hover:bg-yellow-400 hover:-translate-y-1">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {items.length > 0 && (
                                <div className="flex justify-center items-center gap-2 mb-20 font-mono">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 border border-white/10 rounded-sm hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="w-auto px-4 h-8 flex items-center justify-center text-xs text-white border border-white/10 rounded-sm">
                                        [ {page} / {totalPages} ]
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 border border-white/10 rounded-sm hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500 border border-white/10">
                                <Search size={24} />
                            </div>
                            <h3 className="text-xl font-medium text-white">No items found</h3>
                            <p className="text-gray-400 mt-2 font-mono text-xs uppercase tracking-widest">Adjust config parameters</p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
