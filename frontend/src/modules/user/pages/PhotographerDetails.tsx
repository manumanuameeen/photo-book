import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
    MapPin,
    Clock,
    Award,

    ChevronLeft,
    ChevronRight,
    Search,
    X,
    User,
    MessageCircle,
    Star
} from 'lucide-react';

import { toast } from 'sonner';
import { userPhotographerApi } from '../../../services/api/userPhotographerApi';
import { ROUTES } from '../../../constants/routes';
import Loader from '../../../components/Loader';
import { useAuthStore } from '../../auth/store/useAuthStore';
import ReviewForm from '../../shared/components/reviews/ReviewForm';
import ReviewList from '../../shared/components/reviews/ReviewList';
import ReviewStatsSummary from '../../shared/components/reviews/ReviewStatsSummary';
import LikeButton from '../../shared/components/interactions/LikeButton';

interface PhotographerDetail {
    id: string;
    userId: string;
    name: string;
    image: string;
    category: string;
    location: string;
    rating: number;
    reviewsCount: number;
    experience: string;
    responseTime: string;
    bio: string;
    portfolio: string[];
    reviews: {
        id: string;
        userName: string;
        userImage?: string;
        rating: number;
        comment: string;
        date: string;
    }[];
    packages: {
        id: string;
        name: string;
        price: number;
        features: string[];
        likes: string[];
    }[];
    portfolioSections: {
        id: string;
        title: string;
        images: string[];
        likes: string[];
    }[];
    likes: string[];
}

interface PortfolioItem {
    id: string;
    image: string;
    sectionTitle: string;
}

import { ReportModal } from '../../../components/common/ReportModal';
import { CheckAvailabilityModal } from '../components/CheckAvailabilityModal';

const PhotographerDetails = () => {
    const navigate = useNavigate();
    const { user, role } = useAuthStore();
    const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState<{ id: string, type: 'photographer' | 'package', name: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    const [reviewTarget, setReviewTarget] = useState<{ id: string; type: 'photographer' | 'package' }>({ id: '', type: 'photographer' });
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [photographer, setPhotographer] = useState<PhotographerDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSection, setActiveSection] = useState<{ id: string; title: string; images: string[] } | null>(null);

    useEffect(() => {
        if (selectedPackage) {
            toast.info("Package selected. You can now view its reviews.");
        }
    }, [selectedPackage]);

    const { id } = useParams({ strict: false }) as { id: string };

    useEffect(() => {
        if (id) {
            setReviewTarget(prev => ({ ...prev, id, type: 'photographer' }));
        }
    }, [id]);

    useEffect(() => {
        const fetchPhotographer = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                const data = await userPhotographerApi.getPhotographerById(id);
                setPhotographer(data);

                // Portfolio data is already structured in the response
                // No client-side processing needed for now
            } catch (error) {
                console.error("Failed to fetch photographer details:", error);
                toast.error("Failed to load photographer details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPhotographer();
    }, [id]);

    const handleBack = () => {

        navigate({ to: ROUTES.USER.PHOTOGRAPHER });
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (!photographer) return <div className="min-h-screen flex items-center justify-center">Photographer not found</div>;

    const filteredPackages = photographer.packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
    const paginatedPackages = filteredPackages.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-green-700 font-medium hover:underline"
                    >
                        <ChevronLeft size={20} />
                        Back to Search
                    </button>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search portfolio or packages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-8">

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative">
                                <img
                                    src={photographer.image}
                                    alt={photographer.name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                />
                                <div className="absolute bottom-0 right-0 bg-yellow-400 text-white p-1 rounded-full border-2 border-white">
                                    <Award size={12} />
                                </div>
                            </div>

                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h1 className="text-2xl font-bold text-gray-900">{photographer.name}</h1>
                                    <LikeButton
                                        targetId={id!}
                                        targetType="photographer"
                                        initialLikes={photographer.likes}
                                    />
                                </div>
                                <p className="text-green-600 font-medium mb-2">{photographer.category}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                    <ReviewStatsSummary targetId={id!} />
                                    <div className="flex items-center">
                                        <MapPin size={16} className="mr-1" />
                                        {photographer.location}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock size={16} className="mr-1" />
                                        {photographer.experience}
                                    </div>
                                </div>

                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {photographer.bio}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {photographer.responseTime}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {activeSection ? activeSection.title : "Portfolio Albums"}
                                </h2>
                                {activeSection && (
                                    <button
                                        onClick={() => setActiveSection(null)}
                                        className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline flex items-center"
                                    >
                                        <ChevronLeft size={16} className="mr-1" />
                                        Back to Albums
                                    </button>
                                )}
                            </div>

                            {!activeSection ? (

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {photographer.portfolioSections && photographer.portfolioSections.length > 0 ? (
                                        photographer.portfolioSections.map((section) => (
                                            <div
                                                key={section.id}
                                                onClick={() => setActiveSection(section)}
                                                className="group cursor-pointer flex flex-col"
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveSection(section); }}
                                            >
                                                <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-3 group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                                    
                                                    <div className="absolute top-0 right-0 w-full h-full bg-gray-200 translate-x-1 -translate-y-1 rounded-2xl -z-10"></div>
                                                    <div className="absolute top-0 right-0 w-full h-full bg-gray-300 translate-x-2 -translate-y-2 rounded-2xl -z-20"></div>

                                                    <img
                                                        src={section.images[0] || "https://via.placeholder.com/400x300?text=Empty+Album"}
                                                        alt={section.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                                                    <div className="absolute bottom-4 left-4 text-white">
                                                        <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-medium border border-white/30">
                                                            {section.images.length} Photos
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                                            {section.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">
                                                            {section.images.length} images
                                                        </p>
                                                    </div>
                                                    <LikeButton
                                                        targetId={section.id}
                                                        targetType="portfolio"
                                                        initialLikes={section.likes}
                                                        showCount={true}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : photographer.portfolio && photographer.portfolio.length > 0 ? (

                                        <div
                                            onClick={() => setActiveSection({ id: 'legacy', title: 'General Portfolio', images: photographer.portfolio })}
                                            className="group cursor-pointer flex flex-col"
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveSection({ id: 'legacy', title: 'General Portfolio', images: photographer.portfolio }); }}
                                        >
                                            <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-3 group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                                <img
                                                    src={photographer.portfolio[0]}
                                                    alt="General Portfolio"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                                <div className="absolute bottom-4 left-4 text-white">
                                                    <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-medium border border-white/30">
                                                        {photographer.portfolio.length} Photos
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                                    General Portfolio
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {photographer.portfolio.length} images
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-500">No portfolio albums available.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                                    {activeSection.images.map((img, idx) => (
                                        <div
                                            key={`${activeSection.id}-${idx}`}
                                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group relative bg-gray-100"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setSelectedImage({
                                                id: `${activeSection.id}-${idx}`,
                                                image: img,
                                                sectionTitle: activeSection.title
                                            })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    setSelectedImage({
                                                        id: `${activeSection.id}-${idx}`,
                                                        image: img,
                                                        sectionTitle: activeSection.title
                                                    });
                                                }
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`${activeSection.title} ${idx + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                                <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                                                    <Search size={20} className="text-gray-900" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Packages</h2>
                            <div className="space-y-4 mb-6">
                                {paginatedPackages.length > 0 ? (
                                    <>
                                        {paginatedPackages.map((pkg) => (
                                            <div
                                                key={pkg.id}
                                                onClick={() => setSelectedPackage(pkg.id)}
                                                className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedPackage === pkg.id
                                                    ? 'border-green-600 bg-green-50 ring-1 ring-green-600'
                                                    : 'border-gray-200 hover:border-green-300'
                                                    }`}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedPackage(pkg.id); }}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                                                        <LikeButton
                                                            targetId={pkg.id}
                                                            targetType="package"
                                                            initialLikes={pkg.likes}
                                                            className="scale-90"
                                                        />
                                                        {role !== 'photographer' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setReportTarget({ id: pkg.id, type: 'package', name: pkg.name });
                                                                }}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                                title="Report Package"
                                                            >
                                                                <Award size={16} className="rotate-180" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <span className="text-lg font-bold text-gray-900">${pkg.price}</span>
                                                </div>
                                                <ul className="space-y-2">
                                                    {pkg.features.map((feature, i) => (
                                                        <li key={i} className="text-xs text-gray-600 flex items-start">
                                                            <span className="mr-2 text-gray-400">•</span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}

                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center gap-2 mt-6">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>

                                                <span className="text-sm text-gray-600 font-medium">
                                                    Page {currentPage} of {totalPages}
                                                </span>

                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center text-gray-500 text-sm py-4">
                                        No packages match your search
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                <div className="flex gap-4 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setReviewTarget({ id: id!, type: 'photographer' })}
                                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${reviewTarget.type === 'photographer'
                                            ? 'bg-white text-green-700 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        Photographer Reviews
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedPackage) {
                                                setReviewTarget({ id: selectedPackage, type: 'package' });
                                            } else {
                                                toast.error("Please select a package first to view its reviews");
                                            }
                                        }}
                                        className={`text-lg font-bold pb-1 border-b-2 transition-colors ${reviewTarget.type === 'package'
                                            ? 'text-gray-900 border-green-600'
                                            : 'text-gray-400 border-transparent hover:text-gray-600'
                                            }`}
                                    >
                                        Package Reviews
                                    </button>
                                </div>
                                {user?._id && (
                                    <button
                                        onClick={() => navigate({ to: ROUTES.USER.DASHBOARD, search: { tab: 'reviews' } })}
                                        className="text-xs font-bold text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg border border-green-100 transition-all flex items-center gap-1.5"
                                    >
                                        <Star size={14} className="fill-green-700" />
                                        Manage My Reviews
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                {reviewTarget.type === 'package' && !selectedPackage && (
                                    <p className="text-sm text-gray-500 italic">Select a package above to see its reviews.</p>
                                )}
                                {reviewTarget.type === 'package' && selectedPackage && (
                                    <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between gap-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Award size={16} className="text-green-700" />
                                            <span className="text-sm font-medium text-green-800">
                                                Showing reviews for: {photographer.packages.find(p => p.id === selectedPackage)?.name}
                                            </span>
                                        </div>
                                        <ReviewStatsSummary targetId={selectedPackage} />
                                    </div>
                                )}
                            </div>

                            {user?._id !== photographer.userId && (
                                (reviewTarget.type === 'photographer' || (reviewTarget.type === 'package' && selectedPackage)) && (
                                    <div className="mb-8">
                                        <ReviewForm
                                            key={reviewTarget.id}
                                            targetId={reviewTarget.id}
                                            type={reviewTarget.type}
                                        />
                                    </div>
                                )
                            )}

                            {(reviewTarget.type === 'photographer' || (reviewTarget.type === 'package' && selectedPackage)) && (
                                <ReviewList
                                    key={`list-${reviewTarget.id}`}
                                    targetId={reviewTarget.id}
                                    isOwner={user?._id === photographer.userId}
                                />
                            )}
                        </div>

                    </div>

                    <div className="space-y-6">
                        {role !== 'photographer' ? (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Booking Summary</h2>

                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    {selectedPackage ? (
                                        <>
                                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Selected Package</h3>
                                            <p className="font-bold text-gray-900 text-lg">{photographer.packages.find(p => p.id === selectedPackage)?.name}</p>
                                            <p className="font-bold text-green-600 text-xl mt-1">${photographer.packages.find(p => p.id === selectedPackage)?.price}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Select a package from the list to proceed with booking.</p>
                                    )}
                                </div>

                                <button
                                    className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-gray-900 font-bold py-3 rounded-lg shadow-sm transition-all active:scale-95 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!selectedPackage}

                                    onClick={() => navigate({
                                        to: ROUTES.USER.BOOKING,
                                        search: {
                                            photographerId: photographer.id,
                                            packageId: selectedPackage
                                        }
                                    })}
                                >
                                    Book Now
                                </button>

                                <button
                                    onClick={() => setIsAvailabilityModalOpen(true)}
                                    className="w-full bg-white border border-green-600 text-green-700 font-medium py-3 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                    Check Availability
                                </button>

                                <div className="mt-6 text-center flex flex-col gap-2 items-center">
                                    <p className="text-xs text-green-600 mb-1">Need something custom?</p>
                                    <button
                                        onClick={() => navigate({ to: '/chat', search: { userId: photographer.userId } })}
                                        className="text-xs text-green-700 hover:text-green-800 underline flex items-center justify-center gap-1"
                                    >
                                        <MessageCircle size={14} /> Send a Message
                                    </button>
                                    <button
                                        onClick={() => setReportTarget({ id: photographer.id, type: 'photographer', name: photographer.name })}
                                        className="text-xs text-gray-400 hover:text-red-500 flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Award size={14} className="rotate-180" /> Report Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6 text-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User size={32} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Photographer Profile</h2>
                                <p className="text-sm text-gray-500 mb-4">You are viewing another photographer's profile. Booking is restricted for photographer accounts.</p>
                                <button
                                    onClick={() => navigate({ to: ROUTES.USER.HOME })}
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                >
                                    Return to Home
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {
                selectedImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-all duration-300"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedImage(null)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setSelectedImage(null); }}
                    >
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none bg-black/50 rounded-full p-2"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={32} />
                        </button>
                        <div
                            className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                            role="presentation"
                        >
                            <img
                                src={selectedImage.image}
                                alt={selectedImage.sectionTitle}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />
                            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md">
                                {selectedImage.sectionTitle}
                            </div>
                        </div>
                    </div>
                )
            }

            {reportTarget && (
                <ReportModal
                    isOpen={!!reportTarget}
                    onClose={() => setReportTarget(null)}
                    targetId={reportTarget.id}
                    targetType={reportTarget.type}
                    targetName={reportTarget.name}
                />
            )}

            <CheckAvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                photographerId={photographer?.id || ''}
                photographerName={photographer?.name || ''}

                onBook={(date: Date) => {
                    setIsAvailabilityModalOpen(false);

                    navigate({
                        to: ROUTES.USER.BOOKING,
                        search: {
                            photographerId: photographer.id,
                            packageId: selectedPackage || undefined,
                            date: date.toISOString()
                        }
                    });
                }}
            />
        </div>

    );
};

export default PhotographerDetails;
