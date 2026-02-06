import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
    Search,
    ChevronDown,
    Filter,
    MapPin,
    Star,
    AlertCircle,
    Navigation,
    MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { userPhotographerApi, type PhotographerFilter } from '../../../services/api/userPhotographerApi';
import { ROUTES } from '../../../constants/routes';
import Loader from '../../../components/Loader';

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


    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [priceRange, setPriceRange] = useState('All Prices');
    const [location, setLocation] = useState('All Locations');


    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);


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
            if (category !== 'All Categories') filters.category = category;
            if (priceRange !== 'All Prices') filters.priceRange = priceRange;


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
            const errorMessage = (err as any).response?.data?.message || (err as any).message || "Failed to load photographers. Please try again later.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [category, priceRange, location, userLocation]);

    const handleNearMe = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newLoc = { lat: latitude, lng: longitude };
                setUserLocation(newLoc);
                setLocation('All Locations');
                setIsLocating(false);

                fetchPhotographers(newLoc);
                toast.success("Found your location!");
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast.error("Unable to retrieve your location. Please check permissions.");
                setIsLocating(false);
            }
        );
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
                (p.category?.toLowerCase() || '').includes(query) ||
                (p.location?.toLowerCase() || '').includes(query) ||
                (p.tags?.some(tag => (tag?.toLowerCase() || '').includes(query)))
            );
        }
        return true;
    }).filter(p => !user || p.userId !== user._id);

    const isPhotographerClient = user?.role === 'photographer';

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800">


            <div className="bg-[#2E7D46] px-4 py-16 md:py-24 text-center shadow-md relative overflow-hidden">
                <h1 className="text-4xl md:text-6xl text-white mb-4 font-serif italic tracking-wide relative z-10">
                    Find <span className="text-white not-italic font-sans font-bold">Your Perfect</span> <span className="text-yellow-400">Photographer</span>
                </h1>
                <p className="text-green-100 text-sm md:text-lg font-light max-w-2xl mx-auto relative z-10">
                    Browse individual photographers and professional wedding teams for your special occasions.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                { }
                <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 mb-10 border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <div className="flex-grow relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search photographers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-auto">
                            <div className="relative group">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full appearance-none bg-white border border-gray-200 px-4 py-3 pr-10 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer hover:border-green-300 transition-colors"
                                >
                                    <option>All Categories</option>
                                    <option>Wedding</option>
                                    <option>Portrait</option>
                                    <option>Events</option>
                                    <option>Fashion</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-green-600 transition-colors" size={16} />
                            </div>
                            <div className="relative group">
                                <select
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className="w-full appearance-none bg-white border border-gray-200 px-4 py-3 pr-10 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer hover:border-green-300 transition-colors"
                                >
                                    <option>All Prices</option>
                                    <option>$0 - $100/hr</option>
                                    <option>$100 - $200/hr</option>
                                    <option>$200+/hr</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-green-600 transition-colors" size={16} />
                            </div>
                            <div className="relative group">
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full appearance-none bg-white border border-gray-200 px-4 py-3 pr-10 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer hover:border-green-300 transition-colors"
                                >
                                    <option>All Locations</option>
                                    <option>Thiruvananthapuram</option>
                                    <option>Kochi</option>
                                    <option>Kozhikode</option>
                                    <option>Thrissur</option>
                                    <option>Kollam</option>
                                    <option>Alappuzha</option>
                                    <option>Kannur</option>
                                    <option>Kottayam</option>
                                    <option>Palakkad</option>
                                    <option>Malappuram</option>
                                    <option>Waynad</option>
                                    <option>Idukki</option>
                                    <option>Pathanamthitta</option>
                                    <option>Kasargod</option>
                                    <option>New York</option>
                                    <option>Los Angeles</option>
                                    <option>Chicago</option>
                                    <option>Miami</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-green-600 transition-colors" size={16} />
                            </div>
                        </div>

                        <button
                            onClick={handleNearMe}
                            disabled={isLocating}
                            className={`p-3 rounded-lg flex items-center justify-center transition-all shadow-md active:scale-95 border ${userLocation ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
                            title="Find near me"
                        >
                            <Navigation size={20} className={isLocating ? "animate-spin" : ""} />
                            <span className="ml-2 hidden lg:inline">Near Me</span>
                        </button>

                        <button
                            onClick={() => fetchPhotographers()}
                            className="bg-[#2E7D46] hover:bg-[#256639] text-white p-3 rounded-lg flex items-center justify-center transition-all shadow-md active:scale-95"
                        >
                            <Filter size={20} />
                        </button>
                    </div>


                    <div className="flex justify-between items-center w-full">
                        <button className="flex items-center text-xs text-gray-500 hover:text-green-700 font-medium transition-colors">
                            Advanced Filters <ChevronDown size={14} className="ml-1" />
                        </button>
                        <button
                            onClick={() => navigate({ to: '/main/rules' } as any)}
                            className="flex items-center text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
                        >
                            <span className="mr-1">⚠️</span> Platform Rules
                        </button>
                    </div>

                </div>

                { }
                <div className="flex gap-8 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'individual'
                            ? 'border-green-600 text-green-800'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Individual Photographers ({photographers.filter(p => p.type === 'individual').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'groups'
                            ? 'border-green-600 text-green-800'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Wedding Groups ({photographers.filter(p => p.type === 'group').length})
                    </button>
                </div>

                { }
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-red-100">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Ooops! Something went wrong</h3>
                        <p className="mt-2 text-sm text-gray-500">{error}</p>
                        <button
                            onClick={() => fetchPhotographers()}
                            className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredPhotographers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No photographers found</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Try adjusting your filters or search terms to find what you're looking for.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 text-gray-600 font-medium">
                            Found {totalItems} photographers
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                            {filteredPhotographers.map((photographer) => (
                                <div key={photographer.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 hover:translate-y-[-4px]">
                                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                                        <img
                                            src={photographer.image || "https://via.placeholder.com/400x300?text=No+Image"}
                                            alt={photographer.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{photographer.name}</h3>
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <MapPin size={14} className="mr-1" />
                                                    {photographer.location || "Location Unavailable"}
                                                </div>
                                            </div>
                                            <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
                                                <Star size={16} className="text-yellow-500 mr-1 fill-yellow-500" />
                                                <span className="font-bold text-gray-700">{photographer.rating}</span>
                                                <span className="text-gray-400 text-xs ml-1">({photographer.reviews})</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-100">
                                            <div className="text-center border-r border-gray-100">
                                                <div className="text-sm text-gray-400 mb-1">Starting at</div>
                                                <div className="font-bold text-green-700 text-lg">{photographer.price}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-gray-400 mb-1">Experience</div>
                                                <div className="font-bold text-gray-700">{photographer.experience}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {Array.isArray(photographer.tags) && photographer.tags.length > 0 ? (
                                                photographer.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={`${photographer.id}-tag-${index}`} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                    General
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-3 mt-auto">
                                            <button
                                                onClick={() => navigate({ to: ROUTES.USER.PHOTOGRAPHER_DETAILS, params: { id: photographer.id } })}
                                                className={`px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm ${!isPhotographerClient ? 'flex-1' : 'w-full'}`}
                                            >
                                                View Profile
                                            </button>
                                            {!isPhotographerClient && (
                                                <>
                                                    <button
                                                        onClick={() => navigate({ to: '/chat', search: { userId: photographer.userId } })}
                                                        className="px-3 py-2 border border-gray-200 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors text-sm"
                                                        title="Chat"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => toast.success(`Booking ${photographer.name}`)}
                                                        className="flex-1 px-4 py-2 bg-[#1E5631] text-white font-medium rounded-lg hover:bg-[#164024] transition-colors text-sm"
                                                    >
                                                        Book Now
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-2 mb-20">
                            <button
                                onClick={() => fetchPhotographers(undefined, currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronDown className="transform rotate-90" size={20} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => fetchPhotographers(undefined, page)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                        ? 'bg-[#2E7D46] text-white'
                                        : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => fetchPhotographers(undefined, currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronDown className="transform -rotate-90" size={20} />
                            </button>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default PhotographerSearch;