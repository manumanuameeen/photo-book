import React, { useState } from 'react';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Camera,
    DollarSign,
    Instagram,
    Globe,
    Facebook,
    Linkedin,
    User,
    Pencil,
    Plus,
    X,
    Loader2,
    Clock
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { packageApi } from '../../../services/api/packageApi';
import { photographerApi } from '../../../services/api/photographerApi';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const PhotographerProfile = () => {
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ name: string; description: string; type: string; explanation: string }>();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['photographerProfile'],
        queryFn: photographerApi.getProfile
    });

    const onSuggestSubmit = async (data: { name: string; description: string; type: string; explanation: string }) => {
        try {
            await packageApi.suggestCategory(data.name, data.description, data.type, data.explanation);
            toast.success("Category suggestion submitted. Pending Admin approval (approx. 2 business days).");
            setIsSuggestModalOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit suggestion");
        }
    };
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-green-700" size={48} />
                    <p className="text-gray-500 font-medium tracking-wide">Loading your professional profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
                <div className="text-center">
                    <p className="text-red-500 font-bold text-xl mb-4">Could not load profile</p>
                    <Link to={ROUTES.PHOTOGRAPHER.DASHBOARD} className="text-green-700 font-medium hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            <div className="bg-[#1E5631] h-16 w-full shadow-sm"></div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                <div className="mb-8">
                    <Link to={ROUTES.PHOTOGRAPHER.DASHBOARD} className="flex items-center text-sm text-green-700 font-medium hover:underline mb-4">
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">My Account Information</h1>
                        <Link
                            to={ROUTES.PHOTOGRAPHER.EDIT_PROFILE}
                            className="flex items-center gap-2 bg-[#1E5631] text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-[#164024] transition-colors"
                        >
                            <Pencil size={16} />
                            Edit Profile
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="space-y-6">

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-700 mb-6">Personal Identity</h2>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-sm">
                                    {profile.userId.profileImage ? (
                                        <img src={profile.userId.profileImage} alt={profile.userId.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-gray-300" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{profile.userId.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-700 mb-6">Contact Details</h2>
                            <div className="space-y-5">
                                <InfoField
                                    label="Email Address"
                                    value={profile.userId.email}
                                    icon={Mail}
                                />
                                <InfoField
                                    label="Phone Number"
                                    value={profile.userId.phone || 'Not provided'}
                                    icon={Phone}
                                />
                                <InfoField
                                    label="Base Location"
                                    value={profile.baseLocation}
                                    icon={MapPin}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-700 mb-6">Business & Platform Information</h2>
                            <div className="space-y-5">
                                <InfoField
                                    label="Business/Studio Name"
                                    value={profile.businessName}
                                    icon={Briefcase}
                                />
                                <InfoField
                                    label="Main Genre"
                                    value={profile.professionalDetails?.mainGenre || 'General'}
                                    icon={Camera}
                                />
                                <InfoField
                                    label="Notice Interval"
                                    value={profile.professionalDetails?.noticeInterval || '24 hours'}
                                    icon={Clock}
                                />
                                <InfoField
                                    label="Standard Public Rate"
                                    value={`$${profile.professionalDetails?.standardRate || 0}/Hour`}
                                    icon={DollarSign}
                                />
                                
                            </div>
                            <button
                                onClick={() => setIsSuggestModalOpen(true)}
                                className="mt-4 text-sm text-green-700 font-medium hover:underline flex items-center gap-1"
                            >
                                <Plus size={14} /> Suggest a New Category
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-700 mb-6">Social Media Links</h2>
                            <div className="space-y-5">
                                <InfoField
                                    label="Instagram Handle"
                                    value={profile.professionalDetails?.instagram || 'Not linked'}
                                    icon={Instagram}
                                    isLink={!!profile.professionalDetails?.instagram}
                                />
                                <InfoField
                                    label="External Website"
                                    value={profile.professionalDetails?.website || 'Not linked'}
                                    icon={Globe}
                                    isLink={!!profile.professionalDetails?.website}
                                />
                                <InfoField
                                    label="Facebook Page"
                                    value={profile.professionalDetails?.facebook || 'Not linked'}
                                    icon={Facebook}
                                    isLink={!!profile.professionalDetails?.facebook}
                                />
                                <InfoField
                                    label="LinkedIn Profile"
                                    value={profile.professionalDetails?.linkedin || 'Not linked'}
                                    icon={Linkedin}
                                    isLink={!!profile.professionalDetails?.linkedin}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <AnimatePresence>
                {isSuggestModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900">Suggest New Category</h2>
                                <button onClick={() => setIsSuggestModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSuggestSubmit)} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                                        <input
                                            id="name"
                                            {...register("name", { required: "Category name is required" })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                                            placeholder="e.g. Pet Photography"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-bold text-gray-700 mb-1">Category Type</label>
                                        <select
                                            id="type"
                                            {...register("type", { required: "Category type is required" })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Wedding">Wedding</option>
                                            <option value="Portrait">Portrait</option>
                                            <option value="Event">Event</option>
                                            <option value="Lifestyle">Lifestyle</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                    <textarea
                                        id="description"
                                        {...register("description", { required: "Description is required" })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 h-20"
                                        placeholder="Brief description of the category..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="explanation" className="block text-sm font-bold text-gray-700 mb-1">Reason for Suggestion</label>
                                    <textarea
                                        id="explanation"
                                        {...register("explanation", { required: "Explanation is required" })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 h-24"
                                        placeholder="Why is this category needed? Explain the value..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsSuggestModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 flex items-center gap-2"
                                    >
                                        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                        Submit Suggestion
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InfoField = ({ label, value, icon: Icon, isLink = false }: { label: string, value: string, icon: React.ElementType, isLink?: boolean }) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">{label}</label>
        <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-50
      ${isLink ? 'bg-green-50/50 text-green-700' : 'bg-gray-50 text-gray-800'}
    `}>
            <Icon size={18} className={isLink ? 'text-green-600' : 'text-gray-400'} />
            <span className={`text-sm font-medium ${isLink ? 'hover:underline cursor-pointer' : ''}`}>
                {value}
            </span>
        </div>
    </div>
);

export default PhotographerProfile;
