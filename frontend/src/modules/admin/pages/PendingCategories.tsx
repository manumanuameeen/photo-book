import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, ArrowLeft, Layers, Search, Lightbulb, Clock, Eye, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { adminCategoryApi, type Category } from '../../../services/api/adminCategoryApi';
import { toast } from 'sonner';
import { ROUTES } from '../../../constants/routes';

const PendingCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const fetchPendingCategories = useCallback(async () => {
        setIsLoading(true);
        try {

            const data = await adminCategoryApi.getCategories(searchTerm, page, 10, "all", "true");
            if (data && Array.isArray(data.categories)) {
                setCategories(data.categories);
                setTotalPages(data.totalPages || 0);
            }
        } catch (error) {
            toast.error("Failed to load suggestions");
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, page]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPendingCategories();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchPendingCategories]);

    const handleApprove = async (cat: Category) => {
        const message = prompt(`Approve category "${cat.name}"? Enter an optional message for the photographer:`, `Your category suggestion "${cat.name}" has been approved.`);
        if (message === null) return;

        try {
            await adminCategoryApi.approveCategory(cat._id, message);
            toast.success(`Category "${cat.name}" approved and active!`);
            fetchPendingCategories();
            setSelectedCategory(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to approve category");
        }
    };

    const handleReject = async (cat: Category) => {
        if (!confirm(`Discard suggestion "${cat.name}"? This will not block the name.`)) return;
        try {
            await adminCategoryApi.deleteCategory(cat._id);
            toast.success("Suggestion discarded");
            fetchPendingCategories();
            setSelectedCategory(null);
        } catch (error) {
            toast.error("Failed to discard suggestion");
        }
    };

    const handleBlock = async () => {
        if (!selectedCategory) return;
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for blocking");
            return;
        }
        try {
            await adminCategoryApi.rejectCategory(selectedCategory._id, rejectionReason);
            toast.success("Category blocked successfully");
            setIsRejectModalOpen(false);
            setRejectionReason("");
            setSelectedCategory(null);
            fetchPendingCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to block category");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link to={ROUTES.ADMIN.CATEGORIES}>
                            <button className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-gray-900 border border-gray-100">
                                <ArrowLeft size={20} />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Pending Categories</h1>
                            <p className="text-gray-500 mt-1">Review and approve new category suggestions from photographers.</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search pending suggestions..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors shadow-sm"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
                        {categories.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lightbulb size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-700">No pending suggestions</h3>
                                <p className="text-gray-400">Everything is up to date!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map((cat) => (
                                    <motion.div
                                        key={cat._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                    <Clock size={14} /> Pending Review
                                                </div>
                                                <button
                                                    onClick={() => handleReject(cat)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Reject/Discard"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{cat.name}</h3>
                                            <span className="text-sm font-medium text-gray-400 mb-4">{cat.type}</span>

                                            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex-1">
                                                <p className="text-sm text-gray-600 line-clamp-3 italic">
                                                    "{cat.description}"
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className="flex-1 min-w-[100px] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Eye size={16} /> Details
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(cat)}
                                                    className="flex-1 min-w-[100px] bg-[#2E7D46] hover:bg-green-800 text-white font-bold py-2 rounded-xl shadow-lg shadow-green-900/10 transition-all flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Check size={16} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory(cat);
                                                        setIsRejectModalOpen(true);
                                                    }}
                                                    className="flex-1 min-w-[100px] bg-red-50 border border-red-100 text-red-700 font-bold py-2 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <ShieldAlert size={16} /> Block
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>


            <AnimatePresence>
                {selectedCategory && !isRejectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">Category Suggestion Details</h2>
                                <button onClick={() => setSelectedCategory(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category Name</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedCategory.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Event Type</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedCategory.type}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</p>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-700 leading-relaxed">{selectedCategory.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 text-green-700">
                                        <AlertCircle size={14} /> Why is this needed?
                                    </p>
                                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                        <p className="text-gray-700 leading-relaxed italic">
                                            {selectedCategory.explanation || "No explanation provided."}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleReject(selectedCategory)}
                                        className="px-4 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={20} /> Reject
                                    </button>
                                    <button
                                        onClick={() => setIsRejectModalOpen(true)}
                                        className="px-4 py-3 bg-red-50 border border-red-100 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShieldAlert size={20} /> Block
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedCategory)}
                                        className="px-4 py-3 bg-[#2E7D46] text-white font-bold rounded-xl hover:bg-green-800 shadow-lg shadow-green-900/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check size={20} /> Approve
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rejection Modal */}
            <AnimatePresence>
                {isRejectModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900 text-red-700">Block Category Request</h2>
                                <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Reason for Blocking</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 h-32 resize-none"
                                        placeholder="Explain why this category must be blocked..."
                                    />
                                    <p className="text-[10px] text-gray-400 italic">This message will be visible to the photographer.</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setIsRejectModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBlock}
                                        className="flex-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Block Category
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PendingCategories;
