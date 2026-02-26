import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { reportApi, type IReportCategoryResponse } from '../../services/api/reportApi';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'photographer' | 'rental' | 'user' | 'package';
    targetName: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, targetType, targetName }) => {
    const [categories, setCategories] = useState<IReportCategoryResponse[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subReason, setSubReason] = useState('');
    const [description, setDescription] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [evidencePreviews, setEvidencePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            if (evidenceFiles.length + files.length > 3) {
                return toast.error("Maximum 3 evidence files allowed");
            }
            const newFiles = [...evidenceFiles, ...files];
            setEvidenceFiles(newFiles);
            setEvidencePreviews(newFiles.map(f => URL.createObjectURL(f)));
        }
    };

    const removeEvidence = (index: number) => {
        const newFiles = [...evidenceFiles];
        newFiles.splice(index, 1);
        setEvidenceFiles(newFiles);

        const newPreviews = [...evidencePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setEvidencePreviews(newPreviews);
    };

    React.useEffect(() => {
        if (isOpen) {
            reportApi.getCategories()
                .then(data => setCategories((data || []).filter(c => c?.isActive)))
                .catch(console.error);
        }
    }, [isOpen]);

    const activeCategory = categories.find(c => c.name === selectedCategory);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return toast.error("Please select a reason");
        if (activeCategory?.subReasons?.length && !subReason) return toast.error("Please select a sub-reason");
        if (!description) return toast.error("Please provide a description");

        try {
            setIsSubmitting(true);

            let evidenceUrls: string[] = [];
            if (evidenceFiles.length > 0) {
                evidenceUrls = await reportApi.uploadEvidence(evidenceFiles);
            }

            await reportApi.createReport({
                targetId,
                targetType,
                targetName,
                reason: selectedCategory,
                subReason,
                description,
                evidenceUrls
            });

            toast.success(`Report submitted for ${targetName}. Admin will review shortly.`);
            onClose();
            setSelectedCategory('');
            setSubReason('');
            setDescription('');
            setEvidenceFiles([]);
            setEvidencePreviews([]);
        } catch (error) {
            console.error("Report failed", error);
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
                            <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Report Need
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                You are reporting <span className="font-bold">{targetName}</span>.
                                Please describe the issue accurately.
                            </p>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        setSubReason('');
                                    }}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                                >
                                    <option value="">Select a reason</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {activeCategory && activeCategory.subReasons?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Sub Reason</label>
                                    <select
                                        value={subReason}
                                        onChange={(e) => setSubReason(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                                    >
                                        <option value="">Select specific detail</option>
                                        {activeCategory.subReasons.map(sr => (
                                            <option key={sr} value={sr}>{sr}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 h-32 resize-none"
                                    placeholder="Please provide details..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Evidence (Optional, max 3)</label>
                                <div className="mt-1 flex items-center">
                                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <span>Upload Screenshots</span>
                                        <input type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                                {evidencePreviews.length > 0 && (
                                    <div className="mt-3 flex gap-2 flex-wrap">
                                        {evidencePreviews.map((preview, i) => (
                                            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={preview} alt={`Evidence ${i}`} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeEvidence(i)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl hover:bg-red-600">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                    Submit Report
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
