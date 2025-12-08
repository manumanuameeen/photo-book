import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApplicationStore } from '../../store/useApplicationStore';
import { useApply } from '../../hooks/usePhotographer';
import { toast } from 'sonner';
import { CheckCircle2, User, Briefcase, Globe, FileText } from 'lucide-react';
import type { IPhotographerApplicationForm } from '../../types/application.types';

interface ApplyError {
    response?: {
        data: {
            message?: string;
        };
    };
    message?: string;
}

const ReviewStep = () => {
    const { formData, setStep, setApplicationStatus, resetFormDataOnly } = useApplicationStore();
    const applyUser = useApply();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        applyUser.mutate(formData as IPhotographerApplicationForm, {
            onSuccess: (response) => {
                toast.success("Application submitted successfully!");
                console.log("Applied response:", response);
                setApplicationStatus('pending');
                setStep(6);
                resetFormDataOnly();
            },
            onError: (error: unknown) => {
                console.log("Error:", error);
                const errType = error as ApplyError;
                const errorMessage = errType.response?.data?.message || errType.message || "Failed to submit application";
                toast.error(errorMessage);
                setIsSubmitting(false);
            }
        });
    };

    const ReviewSection = ({
        icon: Icon,
        title,
        children
    }: {
        icon: any;
        title: string;
        children: React.ReactNode
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <Icon className="text-green-600" size={24} />
                <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
            </div>
            {children}
        </motion.div>
    );

    const InfoItem = ({ label, value }: { label: string; value: string | undefined }) => (
        <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-gray-800 font-medium">{value || 'Not provided'}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h3 className="text-2xl font-bold text-green-700 mb-2">Review Your Application</h3>
                <p className="text-gray-600">Please review all information before submitting</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReviewSection icon={User} title="Personal Information">
                    <InfoItem label="Full Name" value={formData.name} />
                    <InfoItem label="Email" value={formData.email} />
                    <InfoItem label="Phone" value={formData.phone} />
                    <InfoItem label="Location" value={formData.location} />
                </ReviewSection>

                <ReviewSection icon={Briefcase} title="Professional Details">
                    <InfoItem label="Years of Experience" value={formData.yearsExperience} />
                    <InfoItem label="Price Range" value={formData.priceRange} />
                    <InfoItem label="Availability" value={formData.availability} />
                    <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                            {formData.specialties?.map((spec, idx) => (
                                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                </ReviewSection>

                <ReviewSection icon={Globe} title="Portfolio & Links">
                    <InfoItem label="Portfolio Website" value={formData.portfolioWebsite} />
                    <InfoItem label="Instagram Handle" value={formData.instagramHandle} />
                    <InfoItem label="Personal Website" value={formData.personalWebsite} />
                    <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-2">Portfolio Images</p>
                        {formData.portfolioImages && formData.portfolioImages.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from(formData.portfolioImages).map((file, idx) => (
                                    <div key={idx} className="aspect-square rounded-md overflow-hidden border border-gray-200">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No images selected</p>
                        )}
                    </div>
                </ReviewSection>

                <ReviewSection icon={FileText} title="Business Information">
                    <InfoItem label="Business Name" value={formData.businessName} />
                    <InfoItem label="Professional Title" value={formData.professionalTitle} />
                    <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Business Bio</p>
                        <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded">
                            {formData.businessBio}
                        </p>
                    </div>
                </ReviewSection>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
            >
                <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div>
                    <p className="text-sm text-blue-800 font-medium">Review Complete</p>
                    <p className="text-xs text-blue-600 mt-1">
                        By submitting, you confirm that all information provided is accurate and complete.
                    </p>
                </div>
            </motion.div>

            <div className="flex justify-between mt-10 border-t pt-6">
                <button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Application'
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReviewStep;