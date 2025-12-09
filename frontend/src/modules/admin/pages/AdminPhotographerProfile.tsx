import React, { useState } from 'react';
import {
    Phone,
    Mail,
    MapPin,
    Calendar,
    Camera,
    DollarSign,
    Star,
    CheckCircle,
    ArrowLeft,
    ShieldAlert,
    ShieldCheck,
    Loader2,
    Instagram,
    Globe2,
    X
} from 'lucide-react';
import { useParams, Link } from '@tanstack/react-router';
import { usePhotographerManagement } from '../hooks/usePhotographerManagement';
import { BaseButton } from '../../../components/BaseButton';
import { ROUTES } from "../../../constants/routes";

const AdminPhotographerProfile: React.FC = () => {

    const { id } = useParams({ strict: false });
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const {
        usePhotographerById,
        blockPhotographer,
        unblockPhotographer,
        isBlocking,
        isUnblocking
    } = usePhotographerManagement();


    const {
        data: photographer,
        isLoading,
        isError
    } = usePhotographerById(id || null);

    const handleBlockToggle = async () => {
        if (!photographer) return;

        try {
            if (photographer.isBlock) {
                await unblockPhotographer(photographer.id);
            } else {
                await blockPhotographer({ id: photographer.id, reason: "Blocked by admin" });
            }
        } catch (e) {
            console.error("Failed to toggle block status", e);
        }
    };

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setIsImageModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isError || !photographer) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <p>Photographer not found or error loading data.</p>
                <Link to={ROUTES.ADMIN.PHOTOGRAPHERS}>
                    <BaseButton variant="secondary" className="mt-4">Back to List</BaseButton>
                </Link>
            </div>
        );
    }

    const contactInfo = [
        { icon: Phone, label: "Phone", value: photographer.personalInfo.phone },
        { icon: Mail, label: "Email", value: photographer.personalInfo.email },
        { icon: MapPin, label: "Location", value: photographer.personalInfo.location },
        { icon: Calendar, label: "Member Since", value: new Date(photographer.createdAt).toLocaleDateString() },
        { icon: Camera, label: "Specialties", value: photographer.professionalDetails.specialties.join(", ") },
        { icon: DollarSign, label: "Price Range", value: photographer.professionalDetails.priceRange },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto space-y-6">

                <Link to={ROUTES.ADMIN.PHOTOGRAPHERS}>
                    <button className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
                        <ArrowLeft size={14} className="mr-1" />
                        Back to Photographers
                    </button>
                </Link>


                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(photographer.personalInfo.name)}&background=random&size=128`}
                            alt={photographer.personalInfo.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-50"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">{photographer.personalInfo.name}</h1>
                                {photographer.isBlock && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">BLOCKED</span>
                                )}
                            </div>
                            <p className="text-sm text-green-600 font-medium mb-1">{photographer.businessInfo.businessName || "Photographer"}</p>
                            <div className="inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100 mt-2">
                                <CheckCircle size={12} className="text-green-600 fill-current" />
                                <span className="text-xs font-semibold text-green-700">Verified Photographer</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-end">
                        <div className="flex gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg flex-1 md:flex-none text-center min-w-[100px]">
                                <div className="flex items-center justify-center gap-1 font-bold text-lg text-gray-900">
                                    4.8 <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                </div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Reviews</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg flex-1 md:flex-none text-center min-w-[100px]">
                                <div className="font-bold text-lg text-gray-900">{photographer.professionalDetails.yearsExperience} Year(s)</div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Experience</p>
                            </div>
                        </div>

                        <BaseButton
                            variant={photographer.isBlock ? "primary" : "danger"}
                            className="flex items-center gap-2"
                            loading={isBlocking || isUnblocking}
                            onClick={handleBlockToggle}
                        >
                            {photographer.isBlock ? (
                                <>
                                    <ShieldCheck size={16} /> Unblock User
                                </>
                            ) : (
                                <>
                                    <ShieldAlert size={16} /> Block User
                                </>
                            )}
                        </BaseButton>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {photographer.businessInfo.businessBio}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                        {contactInfo.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <item.icon size={18} className="text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-gray-500">{item.label}</p>
                                    <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h2>
                    {photographer.portfolio.portfolioImages.length > 0 ? (
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                            {photographer.portfolio.portfolioImages.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Portfolio ${index}`}
                                    className="w-full rounded-lg hover:opacity-90 transition-opacity cursor-pointer object-cover bg-gray-100"
                                    style={{ breakInside: 'avoid' }}
                                    onClick={() => openImageModal(src)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No portfolio images uploaded.</p>
                    )} <div className="mt-4 flex flex-wrap gap-4">
                        {photographer.portfolio.portfolioWebsite && (
                            <a href={`https://${photographer.portfolio.portfolioWebsite}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg text-sm">
                                <Globe2 size={16} /> Website
                            </a>
                        )}
                        {photographer.portfolio.instagramHandle && (
                            <a href={`https://instagram.com/${photographer.portfolio.instagramHandle.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-pink-600 hover:underline bg-pink-50 px-3 py-1.5 rounded-lg text-sm">
                                <Instagram size={16} /> Instagram
                            </a>
                        )}
                    </div>
                </div>

            </div>

            {isImageModalOpen && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setIsImageModalOpen(false)}>
                    <div className="relative max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => setIsImageModalOpen(false)} 
                            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors z-10"
                            aria-label="Close image viewer"
                        >
                            <X size={24} />
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Full-size portfolio view" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPhotographerProfile;