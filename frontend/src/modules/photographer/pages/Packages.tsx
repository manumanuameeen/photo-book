
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, X, Package as PackageIcon, Check, Info, Lightbulb, ChevronDown, Image as ImageIcon, Upload, Search, Power, LayoutGrid, CheckCircle2, XCircle, ShieldAlert, Bell, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { packageApi, type PackageData } from '../../../services/api/packageApi';
import { messageApi, type SystemMessage } from '../../../services/api/messageApi';
import { portfolioApi } from '../../../services/api/portfolioApi';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CropModal from '../../../components/common/CropModal';
import { CategoryType } from '../../../services/api/adminCategoryApi';


const packageFormSchema = z.object({
    name: z.string().trim().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(1, "Price must be at least $1"),
    editedPhoto: z.coerce.number().int().min(0, "Must be a positive integer"),
    deliveryTime: z.string().trim().min(2, "Delivery time is required"),
    categoryId: z.string().min(1, "Category is required"),
    features: z.union([
        z.string().transform(str => str.split(',').map(s => s.trim()).filter(s => s.length > 0)),
        z.array(z.string())
    ]),
    coverImage: z.any().optional(),
});

type PackageFormData = z.output<typeof packageFormSchema>;
type PackageFormInput = z.input<typeof packageFormSchema>;

import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';

const Packages = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);


    const [imageSelectionMode, setImageSelectionMode] = useState<'upload' | 'portfolio'>('upload');
    const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
    const [selectedPortfolioImage, setSelectedPortfolioImage] = useState<string | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [croppedFile, setCroppedFile] = useState<File | null>(null);

    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED'>('ALL');

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<SystemMessage[]>([]);


    const { register, handleSubmit, reset, setValue, getValues, watch, formState: { errors } } = useForm<PackageFormInput, any, PackageFormData>({
        resolver: zodResolver(packageFormSchema),
        defaultValues: { features: [] }
    });



    const { register: registerSuggest, handleSubmit: handleSubmitSuggest, reset: resetSuggest, formState: { errors: suggestErrors } } = useForm<{ name: string; type: string; description: string; explanation: string }>({
        defaultValues: { type: CategoryType.OTHER }
    });

    const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
    const [categorySearch, setCategorySearch] = useState("");
    const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);

    useEffect(() => {
        fetchPackages();
        fetchPortfolioImages();
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const msgs = await messageApi.getSystemMessages();
            setNotifications(msgs);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            const isVeryRecent = latest.fullDate ? (new Date().getTime() - new Date(latest.fullDate).getTime() < 30000) : false;

            if (isVeryRecent) {
                toast(`New Notification: ${latest.content.slice(0, 50)}...`, {
                    description: `From ${latest.senderName || 'System'}`,
                    action: {
                        label: 'View',
                        onClick: () => setIsNotificationsOpen(true)
                    },
                });
            }
        }
    }, [notifications]);


    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCategories(categorySearch);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [categorySearch]);


    const fetchPortfolioImages = async () => {
        try {
            const sections = await portfolioApi.getSections();

            const allImages: string[] = [];
            if (Array.isArray(sections)) {
                sections.forEach((section: any) => {
                    if (section.coverImage) allImages.push(section.coverImage);
                    if (section.images && Array.isArray(section.images)) {
                        allImages.push(...section.images);
                    }
                });
            }
            setPortfolioImages([...new Set(allImages)]); // deduplicate
        } catch (error) {
            console.error("Failed to load portfolio images", error);
        }
    };

    const fetchPackages = async () => {
        try {
            const data = await packageApi.getPackages();
            setPackages(data);
        } catch (error) {
            toast.error("Failed to load packages");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async (search?: string) => {
        try {
            const data = await packageApi.getCategories(search);
            if (Array.isArray(data)) {
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    };

    const onSubmit = async (data: PackageFormData) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('price', data.price.toString());
            formData.append('editedPhoto', data.editedPhoto.toString());
            formData.append('deliveryTime', data.deliveryTime);
            formData.append('categoryId', data.categoryId);
            formData.append('isActive', 'true');

            // Handle features
            let featuresArray: string[] = [];
            if (typeof data.features === 'string') {
                featuresArray = (data.features as string).split(',').map((f: string) => f.trim()).filter(f => f.length > 0);
            } else if (Array.isArray(data.features)) {
                featuresArray = data.features;
            }
            formData.append('features', JSON.stringify(featuresArray));

            // Handle cover image
            if (croppedFile) {
                formData.append('coverImage', croppedFile);
            } else if (imageSelectionMode === 'portfolio' && selectedPortfolioImage) {
                formData.append('coverImage', selectedPortfolioImage);
            } else if (imageSelectionMode === 'upload' && data.coverImage && data.coverImage instanceof FileList && data.coverImage.length > 0) {
                formData.append('coverImage', data.coverImage[0]);
            }

            if (editingPackage && editingPackage.id) {
                await packageApi.updatePackage(editingPackage.id, formData);
                toast.success("Package updated successfully");
            } else {
                await packageApi.createPackage(formData);
                toast.success("Package created successfully");
            }
            setIsModalOpen(false);
            fetchPackages();
            reset();
            setEditingPackage(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save package");
        }
    };

    const onSuggestSubmit = async (data: { name: string; type: string; description: string; explanation: string }) => {
        try {
            await packageApi.suggestCategory(data.name, data.description, data.type, data.explanation);
            toast.success("Category suggestion sent to admin for review");
            setIsSuggestModalOpen(false);
            resetSuggest();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to send suggestion";
            toast.error(message);
        }
    };

    const handleEdit = (pkg: PackageData) => {
        setEditingPackage(pkg);
        setValue('name', pkg.name);
        setValue('description', pkg.description);
        setValue('price', pkg.price);
        setValue('editedPhoto', pkg.editedPhoto);
        setValue('deliveryTime', pkg.deliveryTime);
        setValue('features', pkg.features as any);
        setValue('categoryId', pkg.categoryId);

        setImageSelectionMode('upload');
        setSelectedPortfolioImage(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            await packageApi.deletePackage(id);
            toast.success("Package deleted");
            fetchPackages();
        } catch (error) {
            toast.error("Failed to delete package");
        }
    };

    const openCreateModal = () => {
        setEditingPackage(null);
        reset();
        setImageSelectionMode('upload');
        setSelectedPortfolioImage(null);
        setCroppedFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const file = new File([croppedBlob], 'cover-image.jpg', { type: 'image/jpeg' });
        setCroppedFile(file);
    };

    const getStatusColor = (status: string, isActive: boolean) => {
        if (status === 'REJECTED') return 'bg-red-100 text-red-700';
        // Active/Approved
        if (!isActive) return 'bg-gray-100 text-gray-800';
        return 'bg-green-100 text-green-700';
    };

    const filteredPackages = packages.filter(pkg => {
        if (filterStatus === 'ALL') return true;

        // Robust boolean check: true unless explicitly false or "false"
        const isActive = pkg.isActive !== false && String(pkg.isActive) !== 'false';
        const status = pkg.status?.toUpperCase();

        const isLive = status === 'APPROVED' || status === 'ACTIVE';

        if (filterStatus === 'ACTIVE') return isLive && isActive;
        if (filterStatus === 'INACTIVE') return isLive && !isActive;
        if (filterStatus === 'BLOCKED') return status === 'REJECTED';
        return true;
    });

    const handleToggleActive = async (pkg: PackageData) => {
        try {
            const formData = new FormData();
            formData.append('isActive', (!pkg.isActive).toString());
            await packageApi.updatePackage(pkg.id!, formData);

            setPackages(prev => prev.map(p =>
                p.id === pkg.id ? { ...p, isActive: !p.isActive } : p
            ));

            toast.success(`Package ${!pkg.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 mb-8">
                    <button
                        onClick={() => navigate({ to: ROUTES.PHOTOGRAPHER.DASHBOARD })}
                        className="self-start flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={16} /> {/* Requires ArrowLeft import from lucide-react */}
                        <span className="font-medium">Back to Dashboard</span>
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manage Packages</h1>
                            <p className="text-gray-500 mt-1">Create and manage your photography service packages.</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="p-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all relative"
                                >
                                    <Bell size={20} className={notifications.length > 0 ? "text-green-600" : "text-gray-400"} />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotificationsOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                        <MessageSquare size={16} className="text-green-600" /> Notifications
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{notifications.length} New</span>
                                                </div>
                                                <div className="max-h-80 overflow-y-auto">
                                                    {notifications.length > 0 ? (
                                                        notifications.map((notif) => (
                                                            <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-default">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                                                        {notif.senderName || 'System'}
                                                                        {notif.senderRole === 'admin' && (
                                                                            <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[8px] uppercase tracking-tighter">Admin</span>
                                                                        )}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 font-medium">{notif.createdAt}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-700 leading-relaxed">{notif.content}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center">
                                                            <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                                                            <p className="text-xs text-gray-400">No new notifications</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => navigate({ to: ROUTES.PHOTOGRAPHER.DASHBOARD })}
                                                    className="w-full p-3 text-xs font-bold text-green-700 hover:bg-green-50 transition-colors border-t border-gray-50"
                                                >
                                                    View in Dashboard
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => setIsSuggestModalOpen(true)}
                                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all"
                            >
                                <Lightbulb size={20} /> Request Category
                            </button>
                            <button
                                onClick={openCreateModal}
                                className="bg-[#2E7D46] hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-900/10 flex items-center gap-2 transition-all"
                            >
                                <Plus size={20} /> Create New Package
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                    <div className="inline-flex bg-gray-100/50 p-1.5 rounded-xl gap-1">
                        {[
                            { id: 'ALL', label: 'All Packages', icon: LayoutGrid },
                            { id: 'ACTIVE', label: 'Active', icon: CheckCircle2 },
                            { id: 'INACTIVE', label: 'Inactive', icon: XCircle },
                            { id: 'BLOCKED', label: 'Blocked', icon: ShieldAlert }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setFilterStatus(item.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${filterStatus === item.id
                                    ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <item.icon size={16} className={filterStatus === item.id ? "text-green-600" : "text-gray-400"} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        Showing {filteredPackages.length} {filteredPackages.length === 1 ? 'package' : 'packages'}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPackages.map((pkg) => (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col h-full"
                            >
                                <div className="aspect-video bg-gray-200 relative overflow-hidden flex-shrink-0">
                                    {pkg.coverImage ? (
                                        <img src={pkg.coverImage} alt={pkg.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <PackageIcon size={40} opacity={0.5} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(pkg.status, pkg.isActive)}`}>
                                            {pkg.status === 'APPROVED' ? (pkg.isActive ? 'Active' : 'Inactive') : (pkg.status === 'REJECTED' ? 'Blocked' : pkg.status)}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(pkg)} className="bg-white/90 p-2 rounded-lg text-gray-700 hover:text-green-700 shadow-sm">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => pkg.id && handleDelete(pkg.id)} className="bg-white/90 p-2 rounded-lg text-gray-700 hover:text-red-600 shadow-sm">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                                    {pkg.status === 'REJECTED' && pkg.rejectionReason && (
                                        <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                                            <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                                                <Info size={12} /> Rejection Reason:
                                            </p>
                                            <p className="text-xs text-red-600">{pkg.rejectionReason}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {pkg.features?.slice(0, 3).map((feature, idx) => (
                                            <span key={idx} className="bg-green-50 text-green-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
                                                {feature}
                                            </span>
                                        ))}
                                        {pkg.features?.length > 3 && (
                                            <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md">
                                                +{pkg.features.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starting at</p>
                                            <p className="text-lg font-bold text-[#2E7D46]">
                                                ${pkg.price?.toLocaleString() ?? 0}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold text-green-700 whitespace-nowrap">
                                                {pkg.deliveryTime || 'N/A'}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleActive(pkg);
                                                }}
                                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border ${pkg.isActive
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <Power size={10} />
                                                {pkg.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredPackages.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
                                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <PackageIcon size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Packages Yet</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first photography package to start accepting bookings.</p>
                                <button onClick={openCreateModal} className="text-[#2E7D46] font-bold hover:underline">
                                    Create a Package
                                </button>
                            </div>
                        )}
                    </div>
                )}


                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingPackage ? 'Edit Package' : 'Create New Package'}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto">
                                    <form id="packageForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Package Name</label>
                                                <input {...register("name")} className={`w-full p-3 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-500`} placeholder="e.g. Gold Wedding Package" />
                                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>}
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                                <textarea {...register("description")} className={`w-full p-3 bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-500 h-24`} placeholder="Describe what's included..." />
                                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message as string}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    {...register("price")}
                                                    className={`w-full p-3 bg-gray-50 border ${errors.price ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-500`}
                                                    placeholder="0.00"
                                                />
                                                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message as string}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Edited Photos</label>
                                                <input type="number" {...register("editedPhoto")} className={`w-full p-3 bg-gray-50 border ${errors.editedPhoto ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-500`} placeholder="e.g. 50" />
                                                {errors.editedPhoto && <p className="text-xs text-red-500 mt-1">{errors.editedPhoto.message as string}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Time</label>
                                                <input {...register("deliveryTime")} className={`w-full p-3 bg-gray-50 border ${errors.deliveryTime ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-500`} placeholder="e.g. 2 weeks" />
                                                {errors.deliveryTime && <p className="text-xs text-red-500 mt-1">{errors.deliveryTime.message as string}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                                <div className="flex gap-2">
                                                    <div className="relative w-full">
                                                        <div
                                                            className={`w-full p-3 bg-gray-50 border ${errors.categoryId ? 'border-red-500' : 'border-gray-200'} rounded-lg flex items-center justify-between cursor-pointer focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500`}
                                                            onClick={() => setIsCategoryListOpen(!isCategoryListOpen)}
                                                        >
                                                            <span className={categorySearch ? "text-gray-900" : "text-gray-500"}>
                                                                {categories.find(c => c._id === getValues('categoryId'))?.name || "Select Category"}
                                                            </span>
                                                            <ChevronDown size={20} className="text-gray-500" />
                                                        </div>

                                                        {isCategoryListOpen && (
                                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 flex flex-col">
                                                                <div className="p-2 border-b border-gray-100">
                                                                    <div className="flex items-center gap-2 bg-gray-50 px-2 rounded-md">
                                                                        <Search size={16} className="text-gray-400" />
                                                                        <input
                                                                            type="text"
                                                                            className="w-full p-2 bg-transparent text-sm focus:outline-none"
                                                                            placeholder="Search categories..."
                                                                            value={categorySearch}
                                                                            onChange={(e) => setCategorySearch(e.target.value)}
                                                                            autoFocus
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="overflow-y-auto flex-1">
                                                                    {categories.length > 0 ? (
                                                                        categories.map(cat => (
                                                                            <div
                                                                                key={cat._id}
                                                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                                                                                onClick={() => {
                                                                                    setValue('categoryId', cat._id, { shouldValidate: true });
                                                                                    setIsCategoryListOpen(false);
                                                                                    setCategorySearch("");
                                                                                }}
                                                                            >
                                                                                {cat.name}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="p-4 text-center text-gray-500 text-sm">
                                                                            No categories found.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message as string}</p>}
                                                    </div>
                                                    <button type="button" onClick={() => setIsSuggestModalOpen(true)} title="Suggest a new category" className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100">
                                                        <Lightbulb size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Features (Comma separated)</label>
                                                <input {...register("features")} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500" placeholder="e.g. 8 Hours Coverage, 2nd Shooter, Online Gallery" />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>

                                                <div className="flex gap-2 mb-3 bg-gray-100 p-1 rounded-lg w-fit">
                                                    <button
                                                        type="button"
                                                        onClick={() => setImageSelectionMode('upload')}
                                                        className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${imageSelectionMode === 'upload' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        <Upload size={16} /> Upload New
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setImageSelectionMode('portfolio')}
                                                        className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${imageSelectionMode === 'portfolio' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        <ImageIcon size={16} /> From Portfolio
                                                    </button>
                                                </div>

                                                {imageSelectionMode === 'upload' ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                                        />
                                                        {croppedFile && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-xs font-bold text-green-700">Cropped Image:</span>
                                                                <img src={URL.createObjectURL(croppedFile)} alt="Preview" className="w-16 h-10 rounded object-cover border border-green-200" />
                                                            </div>
                                                        )}
                                                        {editingPackage && editingPackage.coverImage && !selectedPortfolioImage && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 w-fit">
                                                                <span>Current:</span>
                                                                <img src={editingPackage.coverImage} alt="Current" className="w-8 h-8 rounded object-cover" />
                                                                <span>(Leave empty to keep)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                        {portfolioImages.length > 0 ? (
                                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                                                {portfolioImages.map((img, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        onClick={() => {
                                                                            setSelectedPortfolioImage(img);
                                                                            setImageToCrop(img);
                                                                            setIsCropModalOpen(true);
                                                                        }}
                                                                        className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedPortfolioImage === img ? 'border-green-500 ring-2 ring-green-100' : 'border-transparent hover:border-gray-300'}`}
                                                                    >
                                                                        <img src={img} alt={`Portfolio ${idx}`} className="w-full h-full object-cover" />
                                                                        {selectedPortfolioImage === img && (
                                                                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                                                <div className="bg-white rounded-full p-1 shadow-sm">
                                                                                    <Check size={12} className="text-green-600" />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8 text-gray-400">
                                                                <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                                                                <p className="text-sm">No images in your portfolio yet.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button form="packageForm" type="submit" className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#2E7D46] hover:bg-green-800 transition-colors flex items-center gap-2">
                                        <Check size={18} /> {editingPackage ? 'Save Changes' : 'Create Package'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {imageToCrop && (
                    <CropModal
                        isOpen={isCropModalOpen}
                        onClose={() => setIsCropModalOpen(false)}
                        image={imageToCrop}
                        onCropComplete={handleCropComplete}
                        aspectRatio={16 / 9}
                    />
                )}

                <AnimatePresence>
                    {isSuggestModalOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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

                                <form onSubmit={handleSubmitSuggest(onSuggestSubmit)} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                                        <input
                                            {...registerSuggest("name", { required: "Name is required" })}
                                            className={`w-full p-3 bg-gray-50 border rounded-lg focus:outline-none transition-colors ${suggestErrors.name ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}
                                            placeholder="e.g. Pet Photography"
                                        />
                                        {suggestErrors.name && <p className="text-red-500 text-xs mt-1">{suggestErrors.name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                        <select {...registerSuggest("type", { required: true })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
                                            {Object.values(CategoryType).map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                        <textarea
                                            {...registerSuggest("description", { required: "Description is required", minLength: { value: 10, message: "Min 10 characters" } })}
                                            className={`w-full p-3 bg-gray-50 border rounded-lg focus:outline-none h-24 transition-colors ${suggestErrors.description ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}
                                            placeholder="What kind of shoots are included?"
                                        />
                                        {suggestErrors.description && <p className="text-red-500 text-xs mt-1">{suggestErrors.description.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Why is this category needed?</label>
                                        <textarea
                                            {...registerSuggest("explanation", { required: "Please explain why this is needed", minLength: { value: 10, message: "Please provide a clearer explanation" } })}
                                            className={`w-full p-3 bg-gray-50 border rounded-lg focus:outline-none h-32 transition-colors ${suggestErrors.explanation ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}
                                            placeholder="e.g. There is a high demand for pet-specific sessions in my area..."
                                        />
                                        {suggestErrors.explanation && <p className="text-red-500 text-xs mt-1">{suggestErrors.explanation.message}</p>}
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => setIsSuggestModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition-colors">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 rounded-xl bg-green-700 text-white font-bold hover:bg-green-800 shadow-lg shadow-green-900/10 transition-all">Submit Suggestion</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Packages;
