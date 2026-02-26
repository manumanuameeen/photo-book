import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Trash2, X, FolderPlus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioApi, type IPortfolioSection } from '../../../services/api/portfolioApi';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../utils/errorhandler';

const SectionCard = ({ section, onDelete, onSelect }: { section: IPortfolioSection, onDelete: (id: string) => void, onSelect: (section: IPortfolioSection) => void }) => {
    return (
        <div
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
            onClick={() => onSelect(section)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onSelect(section);
                }
            }}
        >
            <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {section.coverImage || section.images[0] ? (
                    <img src={section.coverImage || section.images[0]} alt={section.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={32} />
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-gray-800">{section.title}</h4>
                    <span className="text-xs text-gray-500">{section.images.length} images</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(section._id); }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

const ImageGrid = ({ images, onDelete, onAdd }: { images: string[], onDelete: (url: string) => void, onAdd: (files: File[]) => void }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            if (images.length + files.length > 8) {
                toast.error(`Cannot add ${files.length} images. Maximum 8 images allowed. You can add ${8 - images.length} more.`);
                return;
            }
            onAdd(files);

            e.target.value = '';
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, idx) => (
                <div key={idx} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group">
                    <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => onDelete(img)} className="p-2 bg-white text-red-600 rounded-full hover:bg-gray-100">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
            {images.length < 8 && (
                <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer">
                    <Plus size={24} />
                    <span className="text-xs font-bold mt-2">Add Images</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
            )}
        </div>
    );
};

const PortfolioManager = () => {
    const navigate = useNavigate();
    const [sections, setSections] = useState<IPortfolioSection[]>([]);
    const [selectedSection, setSelectedSection] = useState<IPortfolioSection | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");

    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        try {
            const data = await portfolioApi.getSections();
            setSections(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load portfolio sections");
        }
    };

    const handleCreateSection = async () => {
        if (!newSectionTitle.trim()) return;
        try {
            await portfolioApi.createSection(newSectionTitle);
            toast.success("Section created");
            setNewSectionTitle("");
            setIsCreating(false);
            loadSections();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create section");
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm("Are you sure? All images in this section will be removed.")) return;
        try {
            await portfolioApi.deleteSection(id);
            toast.success("Section deleted");
            loadSections();
            if (selectedSection?._id === id) setSelectedSection(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete section");
        }
    };

    const handleAddImage = async (files: File[]) => {
        if (!selectedSection) return;
        if (files.length === 0) return;

        const toastId = toast.loading(`Uploading ${files.length} image(s)...`);
        let successCount = 0;
        let currentSectionState = selectedSection;

        try {

            for (const file of files) {
                try {
                    const updated = await portfolioApi.addImage(currentSectionState._id, file);
                    currentSectionState = updated;
                    successCount++;
                } catch (err) {
                    console.error("Single image upload failed", err);

                }
            }

            setSelectedSection(currentSectionState);
            setSections(sections.map(s => s._id === currentSectionState._id ? currentSectionState : s));

            if (successCount === files.length) {
                toast.success(`Successfully added ${successCount} images`, { id: toastId });
            } else if (successCount > 0) {
                toast.warning(`Added ${successCount} images, but ${files.length - successCount} failed`, { id: toastId });
            } else {
                toast.error("Failed to upload images", { id: toastId });
            }

        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error), { id: toastId });
        }
    };

    const handleDeleteImage = async (url: string) => {
        if (!selectedSection) return;
        try {
            const updated = await portfolioApi.removeImage(selectedSection._id, url);
            setSelectedSection(updated);
            setSections(sections.map(s => s._id === updated._id ? updated : s));
            toast.success("Image removed");
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove image");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">

            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate({ to: ROUTES.PHOTOGRAPHER.DASHBOARD })}
                        className="self-start flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Portfolio Manager</h1>
                            <p className="text-gray-500 mt-1">Organize your work into sections (e.g., Weddings, Outdoors)</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        onClick={() => setIsCreating(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setIsCreating(true);
                            }
                        }}
                        className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-500 hover:bg-green-50/10 transition-all min-h-[200px]"
                    >
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                            <FolderPlus size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">Create New Section</h3>
                        <p className="text-xs text-gray-400 mt-1">Add a new category for your photos</p>
                    </div>

                    {sections.map(section => (
                        <SectionCard
                            key={section._id}
                            section={section}
                            onDelete={handleDeleteSection}
                            onSelect={setSelectedSection}
                        />
                    ))}
                </div>

                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
                            >
                                <h3 className="text-xl font-bold mb-4">New Portfolio Section</h3>
                                <input
                                    type="text"
                                    value={newSectionTitle}
                                    onChange={(e) => setNewSectionTitle(e.target.value)}
                                    placeholder="Section Title (e.g., Candid Moments)"
                                    className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button onClick={handleCreateSection} className="px-4 py-2 bg-[#2E7D46] text-white rounded-lg hover:bg-green-800">Create Section</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedSection && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white z-50 overflow-y-auto"
                        >
                            <div className="max-w-6xl mx-auto p-6 md:p-10">
                                <header className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setSelectedSection(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                            <X size={24} />
                                        </button>
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedSection.title}</h2>
                                            <p className="text-gray-500 text-sm">{selectedSection.images.length} photos</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                                        Settings
                                    </button>
                                </header>

                                <ImageGrid
                                    images={selectedSection.images}
                                    onDelete={handleDeleteImage}
                                    onAdd={handleAddImage}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PortfolioManager;
