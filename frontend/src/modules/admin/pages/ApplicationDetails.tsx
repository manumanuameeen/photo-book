import React, { useState } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { BaseButton } from '../../../components/BaseButton';
import { ArrowLeft, MapPin, Globe, Instagram, Phone, Mail, Award, CheckCircle, XCircle, Send, Loader2, X } from 'lucide-react';
import { ROUTES } from "../../../constants/routes";
import { useApplicationManagement } from '../hooks/useApplicationManagement';

const ApplicationDetails: React.FC = () => {
    const { id } = useParams({ from: '/admin/__layout/applications/$id' });
    const navigate = useNavigate();
    const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [message, setMessage] = useState<string>('');
    const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>('');

    const { useApplicationById, approveApplication, rejectApplication, isApproving, isRejecting } = useApplicationManagement();

    const { data: application, isLoading } = useApplicationById(id);

    const handleActionClick = (type: 'approve' | 'reject'): void => {
        setActionType(type);
        setIsActionModalOpen(true);
        if (type === 'approve') {
            setMessage("Congratulations! Your application has been approved. We are excited to have you on board.");
        } else {
            setMessage("Thank you for your interest. Unfortunately, we cannot proceed with your application at this time because...");
        }
    };

    const confirmAction = async (): Promise<void> => {
        if (!application) return;

        try {
            if (actionType === 'approve') {
                await approveApplication({ id: application.id, message });
            } else if (actionType === 'reject') {
                await rejectApplication({ id: application.id, reason: message });
            }
            setIsActionModalOpen(false);
            navigate({ to: ROUTES.ADMIN.APPLICATIONS });
        } catch (error) {
             console.error("Action failed:", error);
        }
    };

    const openImageModal = (imageUrl: string): void => {
        setSelectedImage(imageUrl);
        setIsImageModalOpen(true);
    };


    const isSubmitting: boolean = isApproving || isRejecting;

    if (isLoading || !application) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading application details...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Link to={ROUTES.ADMIN.APPLICATIONS}>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back to List</span>
                    </button>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(application.personalInfo.name)}&background=random&size=128`}
                        alt="Profile"
                        className="w-16 h-16 rounded-full border-2 border-green-500 p-0.5"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{application.personalInfo.name}</h1>
                        <p className="text-gray-500 text-sm">
                            Applied on {new Date(application.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <BaseButton
                        variant="danger"
                        className="flex items-center gap-2"
                        onClick={() => handleActionClick('reject')}
                        disabled={isSubmitting}
                    >
                        <XCircle size={18} /> Reject
                    </BaseButton>
                    <BaseButton
                        variant="primary"
                        className="flex items-center gap-2"
                        onClick={() => handleActionClick('approve')}
                        disabled={isSubmitting}
                    >
                        <CheckCircle size={18} /> Approve
                    </BaseButton>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Business Profile</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase">Business Name</label>
                                <p className="text-gray-900 font-medium">{application.businessInfo.businessName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase">Title</label>
                                <p className="text-gray-900 font-medium">{application.businessInfo.professionalTitle}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase">Bio</label>
                                <p className="text-gray-700 leading-relaxed">{application.businessInfo.businessBio}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Portfolio</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {application.portfolio.portfolioImages.map((img, i) => (
                                <div 
                                    key={i} 
                                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group relative cursor-pointer"
                                    onClick={() => openImageModal(img)}
                                >
                                    <img src={img} alt={`Portfolio ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4">
                            {application.portfolio.portfolioWebsite && (
                                <a href={`https://${application.portfolio.portfolioWebsite}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg text-sm">
                                    <Globe size={16} /> Website
                                </a>
                            )}
                            {application.portfolio.instagramHandle && (
                                <a href={`https://instagram.com/${application.portfolio.instagramHandle.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-pink-600 hover:underline bg-pink-50 px-3 py-1.5 rounded-lg text-sm">
                                    <Instagram size={16} /> Instagram
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Contact Info</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-700">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <span className="text-sm">{application.personalInfo.email}</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <span className="text-sm">{application.personalInfo.phone}</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <span className="text-sm">{application.personalInfo.location}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Experience</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase">Years of Exp</label>
                                <p className="flex items-center gap-2 font-medium text-gray-900">
                                    <Award className="w-4 h-4 text-yellow-500" />
                                    {application.professionalDetails.yearsExperience} Years
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase">Pricing</label>
                                <p className="font-medium text-gray-900">{application.professionalDetails.priceRange}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase">Specialties</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {application.professionalDetails.specialties.map((s: string) => (
                                        <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isActionModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className={`p-4 border-b flex justify-between items-center ${actionType === 'approve' ? 'bg-green-50' : 'bg-red-50'}`}>
                            <h3 className={`font-bold text-lg ${actionType === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                                {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
                            </h3>
                            <button onClick={() => setIsActionModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {actionType === 'approve' ? 'Approval Message' : 'Reason for Rejection'}
                                </label>
                                <p className="text-xs text-gray-500">This message will be sent to the applicant via email.</p>
                                <textarea
                                    className={`w-full h-32 p-3 border rounded-lg focus:ring-2 outline-none resize-none ${actionType === 'approve' ? 'focus:ring-green-500 border-green-200' : 'focus:ring-red-500 border-red-200'}`}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                            <BaseButton variant="secondary" onClick={() => setIsActionModalOpen(false)}>Cancel</BaseButton>
                            <BaseButton
                                variant={actionType === 'approve' ? 'primary' : 'danger'}
                                onClick={confirmAction}
                                loading={isSubmitting}
                                className="flex items-center gap-2"
                            >
                                <Send size={16} /> Send & {actionType === 'approve' ? 'Approve' : 'Reject'}
                            </BaseButton>
                        </div>
                    </div>
                </div>
            )}
            
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

export default ApplicationDetails;