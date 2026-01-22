import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Package, Calendar, DollarSign, Image as ImageIcon, Info, Ban, RefreshCw } from 'lucide-react';
import { adminPhotographerApi } from '../../../services/api/adminPhotographerApi';
import { toast } from 'sonner';

interface IPackage {
    _id: string;
    photographer: {
        _id: string;
        personalInfo: {
            name: string;
            email: string;
        };
    };
    name: string;
    description: string;
    price: number;
    baseprice?: number;
    editedPhoto: number;
    features: string[];
    deliveryTime: string;
    coverImage?: string;
    isActive: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    categoryId: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

const PackageRequests = () => {
    const [packages, setPackages] = useState<IPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<IPackage | null>(null);

    
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    useEffect(() => {
        fetchPackages();
    }, [statusFilter]);

    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            const data = await adminPhotographerApi.getPackages(1, 50, statusFilter);
            if (data && Array.isArray(data.packages)) {
                setPackages(data.packages);
            }
        } catch (error) {
            toast.error("Failed to load packages");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlock = async (pkg: IPackage) => {
        const reason = prompt(`Please enter the reason for blocking "${pkg.name}":`);
        if (!reason) return;
        if (reason.length < 10) {
            toast.error("Reason must be at least 10 characters");
            return;
        }

        try {
            await adminPhotographerApi.blockPackage(pkg._id, reason);
            toast.success("Package blocked successfully");
            fetchPackages();
            setSelectedPackage(null);
        } catch (error) {
            toast.error("Failed to block package");
        }
    };

    const handleUnblock = async (pkg: IPackage) => {
        if (!confirm(`Are you sure you want to UNBLOCK "${pkg.name}"? It will become visible again.`)) return;
        try {
            await adminPhotographerApi.unblockPackage(pkg._id);
            toast.success("Package unblocked successfully");
            fetchPackages();
            setSelectedPackage(null);
        } catch (error) {
            toast.error("Failed to unblock package");
        }
    };

    const getStatusColor = (status: string, isActive: boolean) => {
        if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
        if (status === 'REJECTED') return 'bg-red-100 text-red-800';
        if (!isActive) return 'bg-gray-100 text-gray-800';
        return 'bg-green-100 text-green-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
                        <p className="text-gray-500 mt-1">Monitor and manage all photographer packages.</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['ALL', 'PENDING', 'APPROVED', 'INACTIVE', 'REJECTED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setSelectedPackage(null); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${statusFilter === status
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {status === 'ALL' ? 'All Packages' : (status === 'APPROVED' ? 'Active' : (status === 'INACTIVE' ? 'Inactive' : (status === 'PENDING' ? 'Pending' : 'Blocked')))}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-lg font-bold text-gray-700 mb-4 px-1">
                                {statusFilter === 'ALL' ? 'All Packages' : (statusFilter === 'APPROVED' ? 'Active Packages' : (statusFilter === 'INACTIVE' ? 'Inactive Packages' : (statusFilter === 'PENDING' ? 'Pending Requests' : 'Blocked Packages')))}
                                <span className="ml-2 text-gray-400 text-sm font-normal">({packages.length})</span>
                            </h2>
                            {packages.length === 0 ? (
                                <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 text-gray-400">
                                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>No packages found.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                                    {packages.map((pkg) => (
                                        <motion.div
                                            key={pkg._id}
                                            layoutId={pkg._id}
                                            onClick={() => setSelectedPackage(pkg)}
                                            className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedPackage?._id === pkg._id ? 'border-gray-900 ring-1 ring-gray-900 shadow-md transform scale-[1.02]' : 'border-gray-200'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(pkg.status, pkg.isActive)}`}>
                                                        {pkg.status === 'APPROVED' ? (pkg.isActive ? 'Active' : 'Inactive') : (pkg.status === 'REJECTED' ? 'Blocked' : pkg.status)}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400">{new Date(pkg.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{pkg.name}</h3>
                                            <p className="text-sm text-gray-500 mb-2">{pkg.photographer?.personalInfo?.name || 'Unknown Photographer'}</p>
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                                <span className="bg-gray-100 px-2 py-1 rounded-md">{pkg.categoryId?.name || 'Uncategorized'}</span>
                                                <span>${pkg.price || pkg.baseprice}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2">
                            {selectedPackage ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={selectedPackage._id}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-8"
                                >
                                    <div className="aspect-video bg-gray-100 relative">
                                        {selectedPackage.coverImage ? (
                                            <img src={selectedPackage.coverImage} alt={selectedPackage.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon size={64} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                            <div className="text-white w-full">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                                                                {selectedPackage.categoryId?.name}
                                                            </span>
                                                        </div>
                                                        <h2 className="text-3xl font-bold">{selectedPackage.name}</h2>
                                                        <p className="text-white/80 font-medium mt-1">By {selectedPackage.photographer?.personalInfo?.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedPackage.status, selectedPackage.isActive)}`}>
                                                            {selectedPackage.status === 'APPROVED' ? (selectedPackage.isActive ? 'Active' : 'Inactive') : (selectedPackage.status === 'REJECTED' ? 'Blocked' : selectedPackage.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        {selectedPackage.rejectionReason && (
                                            <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 text-red-700">
                                                <Info className="shrink-0" size={20} />
                                                <div>
                                                    <p className="font-bold text-sm">Status Info:</p>
                                                    <p className="text-sm">{selectedPackage.rejectionReason}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Package Details</h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <DollarSign size={18} className="text-gray-400" />
                                                        <span className="font-bold text-lg">${selectedPackage.price || selectedPackage.baseprice}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <Calendar size={18} className="text-gray-400" />
                                                        <span>Delivers in <span className="font-bold">{selectedPackage.deliveryTime}</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <ImageIcon size={18} className="text-gray-400" />
                                                        <span><span className="font-bold">{selectedPackage.editedPhoto}</span> Edited Photos</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                                <p className="text-gray-600 leading-relaxed text-sm">{selectedPackage.description}</p>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Included Features</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPackage.features?.map((feature, i) => (
                                                    <span key={i} className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-100 flex items-center gap-2">
                                                        <Check size={14} className="text-green-500" /> {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-8 flex justify-end gap-3">
                                            {selectedPackage.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => handleBlock(selectedPackage)}
                                                    className="px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/10 flex items-center gap-2"
                                                >
                                                    <Ban size={18} /> Block Package
                                                </button>
                                            )}

                                            {selectedPackage.status === 'REJECTED' && (
                                                <button
                                                    onClick={() => handleUnblock(selectedPackage)}
                                                    className="px-6 py-3 rounded-xl font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-lg shadow-gray-900/10 flex items-center gap-2"
                                                >
                                                    <RefreshCw size={18} /> Unblock
                                                </button>
                                            )}

                                            {selectedPackage.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleBlock(selectedPackage)}
                                                        className="px-6 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        Reject / Block
                                                    </button>
                                                    <button
                                                        onClick={() => handleUnblock(selectedPackage)}
                                                        className="px-8 py-3 rounded-xl font-bold text-white bg-[#2E7D46] hover:bg-green-800 transition-colors shadow-lg shadow-green-900/10 flex items-center gap-2"
                                                    >
                                                        <Check size={18} /> Approve
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                    <Package size={48} className="mb-4 opacity-50" />
                                    <p className="font-medium">Select a package to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageRequests;
