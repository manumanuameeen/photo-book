import React, { type ChangeEvent, useState } from "react";
import { useApplicationStore } from "../../store/useApplicationStore";
import { FormInput } from "../../../../components/common/FormInput";
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProtfolioStep = () => {
    const { formData, updateFormData, setStep } = useApplicationStore()

    const [localData, setLocalData] = useState({
        portfolioWebsite: formData.portfolioWebsite || "",
        instagramHandle: formData.instagramHandle || "",
        personalWebsite: formData.personalWebsite || "",
    })

    const [files, setFiles] = useState<File[]>(formData.portfolioImages ? Array.from(formData.portfolioImages) : []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setLocalData({
            ...localData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

          
            if (files.length + newFiles.length > 10) {
                toast.error("You can upload a maximum of 10 images.");
                return;
            }

            
            const uniqueFiles = newFiles.filter(newFile =>
                !files.some(existingFile =>
                    existingFile.name === newFile.name && existingFile.size === newFile.size
                )
            );

            if (uniqueFiles.length < newFiles.length) {
                toast.info("Some duplicate images were skipped.");
            }

            setFiles(prev => [...prev, ...uniqueFiles]);
            e.target.value = "";
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const isFormValid = localData.portfolioWebsite && files.length >= 5 && files.length <= 10;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            if (!localData.portfolioWebsite) {
                toast.error("Please provide your portfolio website.");
            } else if (files.length < 5) {
                toast.error(`Please upload at least 5 images (currently ${files.length}).`);
            }
            return;
        }

        updateFormData(localData);
        updateFormData({ portfolioImages: files });

        setStep(4);
    }

    return (
        <form onSubmit={handleNext}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h3 className="text-xl font-medium text-green-700 mb-2">Portfolio & Work</h3>
                <p className="text-gray-500 text-sm">Showcase your best work to get approved faster.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <FormInput
                    label="Primary Portfolio Website (Required)"
                    name="portfolioWebsite"
                    placeholder="https://yourportfolio.com"
                    value={localData.portfolioWebsite}
                    onChange={handleChange}
                    type="url"
                />
                <FormInput
                    label="Instagram Handle (Optional)"
                    name="instagramHandle"
                    placeholder="@yourhandle"
                    value={localData.instagramHandle}
                    onChange={handleChange}
                />
                <FormInput
                    label="Personal Website / Blog (Optional)"
                    name="personalWebsite"
                    placeholder="https://yourblog.com"
                    value={localData.personalWebsite}
                    onChange={handleChange}
                    type="url"
                />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Upload Portfolio Images (Min 5, Max 10)
                    </label>
                    <span className={`text-xs px-2 py-1 rounded-full ${files.length >= 5 && files.length <= 10 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {files.length} / 10 Selected
                    </span>
                </div>

                <div className="relative group">
                    <input
                        type="file"
                        id="portfolio-upload"
                        name="portfolioImages"
                        accept="image/jpeg, image/png, image/webp"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="portfolio-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-green-50 hover:border-green-400 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-500 mb-2 transition-colors" />
                            <p className="text-sm text-gray-500 group-hover:text-green-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-400">JPG, PNG, WebP (MAX 10MB)</p>
                        </div>
                    </label>
                </div>

                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6"
                        >
                            {files.map((file, index) => (
                                <motion.div
                                    key={`${file.name}-${index}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    layout
                                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                                >
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Portfolio ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:scale-110 transition-all"
                                            title="Remove image"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                                        {(file.size / 1024 / 1024).toFixed(1)} MB
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {files.length === 0 && (
                    <div className="mt-6 flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
                        <ImageIcon size={48} className="mb-2 opacity-50" />
                        <p>No images selected yet</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-10 border-t pt-5">
                <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                    onClick={() => setStep(2)}
                >
                    Previous
                </button>
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                    Next Step
                </button>
            </div>
        </form>
    );
}

export default ProtfolioStep;