import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
    MapPin,
    Star,
    Clock,
    Award,

    ChevronLeft,
    ChevronRight,
    Search,
    X
} from 'lucide-react';



import { toast } from 'sonner';
import { userPhotographerApi } from '../../../services/api/userPhotographerApi';
import { ROUTES } from '../../../constants/routes';
import Loader from '../../../components/Loader';
import { useAuthStore } from '../../auth/store/useAuthStore';

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
    }[];
    portfolioSections: {
        id: string;
        title: string;
        images: string[];
    }[];
}

interface PortfolioItem {
    id: string;
    image: string;
    sectionTitle: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


import { CheckAvailabilityModal } from '../components/CheckAvailabilityModal';

const PhotographerDetails = () => {
    const navigate = useNavigate();
    const { user, role } = useAuthStore();
    const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 3;


    const { id } = useParams({ strict: false });

    const [photographer, setPhotographer] = useState<PhotographerDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [portfolioImages, setPortfolioImages] = useState<PortfolioItem[]>([]);
    const [activeSection, setActiveSection] = useState<{ id: string; title: string; images: string[] } | null>(null);


    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchPhotographer = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                const data = await userPhotographerApi.getPhotographerById(id);
                setPhotographer(data);



                if (data.portfolioSections && data.portfolioSections.length > 0) {
                    const flattened: PortfolioItem[] = [];
                    data.portfolioSections.forEach((section: { id: string; title: string; images: string[] }) => {
                        section.images.forEach((img: string, idx: number) => {
                            flattened.push({
                                id: `${section.id}-${idx}`,
                                image: img,
                                sectionTitle: section.title
                            });
                        });
                    });
                    setPortfolioImages(shuffleArray(flattened));
                } else if (data.portfolio && Array.isArray(data.portfolio) && data.portfolio.length > 0) {

                    const flattened: PortfolioItem[] = data.portfolio.map((img: string, idx: number) => ({
                        id: `legacy-${idx}`,
                        image: img,
                        sectionTitle: 'General'
                    }));
                    setPortfolioImages(shuffleArray(flattened));
                }


            } catch (error) {
                console.error("Failed to fetch photographer details:", error);
                toast.error("Failed to load photographer details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPhotographer();
    }, [id]);

    const handleSubmitReview = async () => {
        if (!id) return;
        if (!reviewComment.trim()) {
            toast.error("Please provide a comment");
            return;
        }

        try {
            setIsSubmittingReview(true);
            await userPhotographerApi.addReview(id, {
                rating: reviewRating,
                comment: reviewComment
            });
            toast.success("Review submitted successfully!");
            setIsReviewOpen(false);
            setReviewComment("");
            setReviewRating(5);


            const data = await userPhotographerApi.getPhotographerById(id);
            setPhotographer(data);
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Failed to submit review:", error);
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };



    const handleBack = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigate({ to: ROUTES.USER.PHOTOGRAPHER as any });
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (!photographer) return <div className="min-h-screen flex items-center justify-center">Photographer not found</div>;

    const filteredPackages = photographer.packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filtered portfolio images logic removed as it was unused and causing lint errors

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

                    { }
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
                    { }
                    <div className="lg:col-span-2 space-y-8">

                        { }
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
                                <h1 className="text-2xl font-bold text-gray-900">{photographer.name}</h1>
                                <p className="text-green-600 font-medium mb-2">{photographer.category}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center">
                                        <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                                        <span className="font-bold text-gray-700 mr-1">{photographer.rating}</span>
                                        <span>({photographer.reviewsCount} reviews)</span>
                                    </div>
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

                        { }
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
                                                    { }
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
                                                <div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                                        {section.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {section.images.length} images
                                                    </p>
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

                        { }
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
                                                    <h3 className="font-bold text-gray-900">{pkg.name}</h3>
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

                                        { }
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

                        { }
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Client Reviews</h2>
                                {user?._id !== photographer.userId && (
                                    <button
                                        onClick={() => setIsReviewOpen(!isReviewOpen)}
                                        className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>

                            {isReviewOpen && (
                                <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-3">Share your experience</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none transition-transform active:scale-95"
                                                >
                                                    <Star
                                                        size={24}
                                                        className={`${star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                        <textarea
                                            id="review-comment"
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Tell us about your experience..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsReviewOpen(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={isSubmittingReview}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {photographer.reviews && photographer.reviews.length > 0 ? (
                                    photographer.reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {review.userImage ? (
                                                        <img src={review.userImage} alt={review.userName} className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                                                            {review.userName.charAt(0)}
                                                        </div>
                                                    )}
                                                    <h3 className="font-bold text-gray-900">{review.userName}</h3>
                                                </div>
                                                <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex mb-2 ml-10">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed ml-10">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        No reviews yet. Be the first to share your experience!
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    { }
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
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    } as any)}
                                >
                                    Book Now
                                </button>

                                <button
                                    onClick={() => setIsAvailabilityModalOpen(true)}
                                    className="w-full bg-white border border-green-600 text-green-700 font-medium py-3 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                    Check Availability
                                </button>

                                <div className="mt-6 text-center">
                                    <p className="text-xs text-green-600 mb-1">Need something custom?</p>
                                    <button className="text-xs text-gray-500 underline hover:text-green-700">Contact Photographer</button>
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

            { }
            {selectedImage && (
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        search: {
                            photographerId: photographer.id,
                            packageId: selectedPackage || undefined,
                            date: date.toISOString()
                        } as any
                    });
                }}
            />
        </div>

    );
};

export default PhotographerDetails;
