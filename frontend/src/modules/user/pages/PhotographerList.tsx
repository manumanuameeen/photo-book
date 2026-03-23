import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
    Search,
    ChevronDown,
    MapPin,
    Star,
    MessageCircle,
    AlertCircle,
    Award
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { userPhotographerApi, type PhotographerFilter } from '../../../services/api/userPhotographerApi';
import apiClient from '../../../services/apiClient';
import { ROUTES } from '../../../constants/routes';
import Loader from '../../../components/Loader';
import { ReportModal } from '../../../components/common/ReportModal';
import { MagneticButton } from '../../../components/common/MagneticButton';

interface Photographer {
    id: string;
    userId: string;
    name: string;
    image: string;
    category: string;
    location: string;
    rating: number;
    reviews: number;
    price: string;
    photosCount: string;
    experience: string;
    tags: string[];
    available: boolean;
    type: 'individual' | 'group';
}

const PhotographerSearch = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'individual' | 'groups'>('individual');
    const { user } = useAuthStore();

    const [photographers, setPhotographers] = useState<Photographer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [reportTarget, setReportTarget] = useState<{ id: string, type: 'photographer' | 'package', name: string } | null>(null);

    // AI Search States
    const [aiSearchQuery, setAiSearchQuery] = useState('');
    const [aiSearchResults, setAiSearchResults] = useState<{ photoId?: string, url?: string, image?: string }[]>([]);
    const [isAiSearching, setIsAiSearching] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('All Locations');

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [totalItems, setTotalItems] = useState(0);

    const fetchPhotographers = useCallback(async (forcedLocation?: { lat: number; lng: number } | null, page: number = 1) => {
        try {
            setIsLoading(true);
            setError(null);

            const locToUse = forcedLocation !== undefined ? forcedLocation : userLocation;

            const filters: PhotographerFilter = {
                page,
                limit: ITEMS_PER_PAGE
            };

            if (locToUse) {
                filters.lat = locToUse.lat;
                filters.lng = locToUse.lng;
            } else if (location !== 'All Locations') {
                filters.location = location;
            }

            const response = await userPhotographerApi.getPhotographers(filters);
            setPhotographers(response.photographers || []);
            setTotalPages(response.totalPages || 1);
            setTotalItems(response.total || 0);
            setCurrentPage(page);
        } catch (err: unknown) {
            console.error("Failed to fetch photographers:", err);
            const error = err as { response?: { data?: { message?: string } }, message?: string };
            const errorMessage = error.response?.data?.message || error.message || "Failed to load photographers. Please try again later.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [location, userLocation]);

    const handleAiSearch = async () => {
        if (!aiSearchQuery.trim()) return;

        setIsAiSearching(true);
        try {
            const response = await apiClient.get(`/ai/search?q=${encodeURIComponent(aiSearchQuery)}`);
            const data = response.data;
            if (data.success || response.status === 200) {
                setAiSearchResults(data.results || data.data || []);
            } else {
                toast.error('AI search failed');
            }
        } catch (error) {
            console.error('AI search error:', error);
            toast.error('AI search failed');
        } finally {
            setIsAiSearching(false);
        }
    };

    useEffect(() => {
        if (location !== 'All Locations') {
            setUserLocation(null);
        }
        setCurrentPage(1);
    }, [location]);

    useEffect(() => {
        fetchPhotographers(undefined, 1);
    }, [fetchPhotographers]);

    const filteredPhotographers = photographers.filter(p => {
        if (activeTab === 'individual' && p.type !== 'individual') return false;
        if (activeTab === 'groups' && p.type !== 'group') return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                (p.name?.toLowerCase() || '').includes(query) ||
                (p.location?.toLowerCase() || '').includes(query) ||
                (p.tags?.some(tag => (tag?.toLowerCase() || '').includes(query)))
            );
        }
        return true;
    }).filter(p => !user || p.userId !== user._id);

    const isPhotographerClient = user?.role === 'photographer';

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
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
        <div className="min-h-screen bg-green-950 font-sans text-gray-200">
            {/* Cinematic Background Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>

            <div className="relative pt-24 pb-12 px-4 text-center overflow-hidden z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <p className="text-yellow-500 font-mono text-xs tracking-[0.3em] mb-4">// EXPERTISE //</p>
                    <h1 className="text-5xl md:text-7xl font-light text-white mb-6">
                        Find Your <br />
                        <span className="font-bold italic text-yellow-400">Photographer</span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base font-light max-w-2xl mx-auto">
                        Browse top-tier talent for your special occasions. Cinematic, elegant, and timeless.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

                {/* Glassmorphism Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl md:rounded-full p-2 md:p-3 mb-10 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center w-full">
                        <div className="flex-grow w-full md:w-auto relative flex items-center bg-white/5 rounded-full px-5 py-3">
                            <Search className="text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search 'Wedding Photographer'..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 bg-transparent border-none text-white focus:ring-0 outline-none placeholder-gray-500 text-base"
                            />
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/10 mx-2"></div>

                        <div className="w-full md:w-auto relative group bg-white/5 rounded-full px-5 py-3">
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full appearance-none bg-transparent border-none text-gray-300 focus:outline-none focus:ring-0 cursor-pointer pr-8 [&>option]:text-gray-900 text-base"
                            >
                                <option value="All Locations">All Locations</option>
                                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                <option value="Kochi">Kochi</option>
                                <option value="Kozhikode">Kozhikode</option>
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-yellow-500 transition-colors" size={16} />
                        </div>

                        <MagneticButton
                            className="w-full md:w-auto px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-green-950 font-bold rounded-full transition-all duration-300 shadow-lg shrink-0 mt-2 md:mt-0"
                            onClick={() => { }}
                        >
                            <span className="flex items-center gap-2">search</span>
                        </MagneticButton>
                    </div>

                    <div className="flex justify-between items-center w-full px-6 pt-3 pb-1 md:pb-0">
                        <button className="flex items-center text-xs text-gray-400 hover:text-yellow-500 font-medium transition-colors">
                            Advanced Config <ChevronDown size={14} className="ml-1" />
                        </button>
                        <button
                            onClick={() => navigate({ to: '/main/rules' })}
                            className="flex items-center text-xs text-gray-400 hover:text-white font-medium transition-colors"
                        >
                            <span className="mr-1">⚠️</span> Platform Guidelines
                        </button>
                    </div>
                </motion.div>

                {/* AI Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="bg-green-900/20 border border-green-500/20 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-4 mb-10 shadow-xl relative overflow-hidden group"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
                        <div className="grow w-full relative flex items-center bg-black/40 border border-white/5 rounded-full px-6 py-4 focus-within:border-green-500/50 transition-colors">
                            <Search className="text-green-500" size={22} />
                            <input
                                type="text"
                                placeholder="Describe the photo you need... e.g. 'sunset beach wedding'"
                                value={aiSearchQuery}
                                onChange={(e) => setAiSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAiSearch()}
                                className="w-full pl-4 bg-transparent border-none text-white focus:ring-0 outline-none placeholder-green-300/50 text-base font-light"
                            />
                        </div>
                        <MagneticButton
                            className={`w-full md:w-auto px-8 py-4 font-bold rounded-full transition-all duration-300 shadow-lg ${isAiSearching
                                ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-white/5'
                                : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]'
                                }`}
                            onClick={isAiSearching ? undefined : handleAiSearch}
                        >
                            <span className="flex items-center gap-2 uppercase tracking-wide text-sm font-mono">
                                {isAiSearching ? 'Analyzing...' : 'Neural Search'}
                            </span>
                        </MagneticButton>
                    </div>
                    {aiSearchResults.length > 0 && (
                        <div className="mt-6 p-6 bg-black/30 border border-white/5 rounded-2xl backdrop-blur-md">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-green-400 text-xs font-mono uppercase tracking-widest text-[10px]">Neural Pattern Match</p>
                                <span className="text-gray-500 text-xs font-mono">{aiSearchResults.length} Artifacts</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {aiSearchResults.slice(0, 8).map((result: { photoId?: string, url?: string, image?: string }, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={result.photoId || i}
                                        className="aspect-square bg-[#111] rounded-xl overflow-hidden border border-white/10 relative group/img cursor-pointer"
                                    >
                                        <img src={result.url || result.image} alt="AI search result" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <Search size={20} className="text-white" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                <div className="flex gap-8 mb-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'individual'
                            ? 'border-yellow-500 text-yellow-500'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Pioneers ({photographers.filter(p => p.type === 'individual').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'groups'
                            ? 'border-yellow-500 text-yellow-500'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Collectives ({photographers.filter(p => p.type === 'group').length})
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-red-500/20 backdrop-blur-md">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-white">System Error</h3>
                        <p className="mt-2 text-sm text-gray-400">{error}</p>
                        <button
                            onClick={() => fetchPhotographers()}
                            className="mt-6 px-6 py-2 bg-yellow-500 text-green-950 font-bold rounded-full hover:bg-yellow-400 transition-colors"
                        >
                            Re-initialize
                        </button>
                    </div>
                ) : filteredPhotographers.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <Search className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-white">No Profiles Found</h3>
                        <p className="mt-2 text-sm text-gray-400">
                            Try adjusting your search criteria or location.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 text-gray-400 font-mono text-xs uppercase tracking-widest">
                            [ {totalItems} Profiles Indexed ]
                        </div>
                        <motion.div
                            key={searchQuery}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {filteredPhotographers.map((photographer) => (
                                <motion.div
                                    variants={fadeInUp}
                                    key={photographer.id}
                                    className="group bg-[#0a0a0a]/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full border border-white/5 hover:border-yellow-500/30 transition-all duration-300"
                                >
                                    <div className="relative h-64 overflow-hidden bg-[#111]">
                                        <img
                                            src={photographer.image || `https://ui-avatars.com/api/?name=${photographer.name?.replace(' ', '+') || 'P'}&size=400&background=111&color=fff`}
                                            alt={photographer.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                        {!isPhotographerClient && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReportTarget({ id: photographer.id, type: 'photographer', name: photographer.name });
                                                }}
                                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-yellow-500 hover:text-green-950 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10"
                                                title="Flag Profile"
                                            >
                                                <Award size={16} className="rotate-180" />
                                            </button>
                                        )}

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-xl font-medium text-white mb-1 drop-shadow-md">{photographer.name}</h3>
                                            <div className="flex items-center text-gray-300 text-xs font-mono">
                                                <MapPin size={12} className="mr-1 text-yellow-500" />
                                                {photographer.location || "Location Unavailable"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow relative">
                                        <div className="absolute -top-6 right-4 flex items-center bg-yellow-500 px-2 py-1 rounded-sm shadow-lg text-green-950">
                                            <Star size={12} className="mr-1 fill-current" />
                                            <span className="font-bold text-xs">{photographer.rating ? photographer.rating.toFixed(1) : 'New'}</span>
                                            <span className="text-xs ml-1 opacity-70">({photographer.reviews || 0})</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-5 pt-3 border-b border-white/5 pb-4">
                                            <div className="text-left border-r border-white/5">
                                                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Base Rate</div>
                                                <div className="font-light text-white text-lg">{photographer.price}</div>
                                            </div>
                                            <div className="text-left pl-2">
                                                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Exp Level</div>
                                                <div className="font-light text-gray-300">{photographer.experience || 'Pro'}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {Array.isArray(photographer.tags) && photographer.tags.length > 0 ? (
                                                photographer.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={`${photographer.id}-tag-${index}`} className="px-2 py-1 bg-white/5 text-gray-400 rounded-sm text-[10px] font-mono uppercase tracking-wider border border-white/10">
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="px-2 py-1 bg-white/5 text-gray-400 rounded-sm text-[10px] font-mono uppercase tracking-wider border border-white/10">
                                                    {photographer.category || 'Event'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-auto">
                                            <button
                                                onClick={() => navigate({ to: ROUTES.USER.PHOTOGRAPHER_DETAILS, params: { id: photographer.id } })}
                                                className={`px-3 py-2 border border-white/20 text-white text-xs font-mono uppercase rounded-sm hover:bg-white/10 transition-colors ${!isPhotographerClient ? 'flex-1' : 'w-full'}`}
                                            >
                                                Details
                                            </button>
                                            {!isPhotographerClient && (
                                                <>
                                                    <button
                                                        onClick={() => navigate({ to: '/chat', search: { userId: photographer.userId } })}
                                                        className="px-3 py-2 border border-white/20 text-white rounded-sm hover:bg-white/10 transition-colors"
                                                        title="Transmit Message"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toast.success(`Booking ${photographer.name}`)}
                                                        className="flex-1 px-3 py-2 bg-yellow-500 text-green-950 font-bold text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-yellow-400 transition-colors"
                                                    >
                                                        Request
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="flex justify-center items-center gap-2 mb-20 font-mono">
                            <button
                                onClick={() => fetchPhotographers(undefined, currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-white/10 rounded-sm hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                            >
                                <ChevronDown className="transform rotate-90" size={16} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => fetchPhotographers(undefined, page)}
                                    className={`w-8 h-8 rounded-sm text-xs transition-colors ${currentPage === page
                                        ? 'bg-yellow-500 text-green-950 font-bold'
                                        : 'border border-white/10 hover:bg-white/5 text-gray-400'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => fetchPhotographers(undefined, currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-white/10 rounded-sm hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                            >
                                <ChevronDown className="transform -rotate-90" size={16} />
                            </button>
                        </div>

                    </>
                )}
            </div>

            {reportTarget && (
                <ReportModal
                    isOpen={!!reportTarget}
                    onClose={() => setReportTarget(null)}
                    targetId={reportTarget.id}
                    targetType={reportTarget.type}
                    targetName={reportTarget.name}
                />
            )}
        </div>
    );
};

export default PhotographerSearch;