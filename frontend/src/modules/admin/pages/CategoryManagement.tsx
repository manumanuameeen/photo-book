import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, ArrowLeft, Layers, Search, Lightbulb, CheckCircle2, ShieldAlert, Power } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminCategoryApi, type Category, CategoryType } from '../../../services/api/adminCategoryApi';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { ROUTES } from "../../../constants/routes"
const CategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'REQUESTS'>('ALL');

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Category>({
        defaultValues: { type: CategoryType.OTHER }
    });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            let isBlocked: "all" | "true" | "false" = "all";
            if (filterStatus === 'ACTIVE') isBlocked = "false";
            if (filterStatus === 'BLOCKED') isBlocked = "true";

            let isActive: "all" | "true" | "false" = "all";
            if (filterStatus === 'ACTIVE') isActive = "true";
            if (filterStatus === 'INACTIVE') isActive = "false";

            const isSuggested = filterStatus === 'REQUESTS' ? "true" : "false";
            const data = await adminCategoryApi.getCategories(searchTerm, page, 10, isBlocked, isSuggested, isActive);
            if (data && Array.isArray(data.categories)) {
                setCategories(data.categories);
                setTotalPages(data.totalPages || 0);
            }
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, page, filterStatus]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCategories();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchCategories]);

    const onSubmit = async (data: Category) => {
        try {
            if (editingCategory && editingCategory._id) {
                await adminCategoryApi.updateCategory(editingCategory._id, data);
                toast.success("Category updated successfully");
            } else {
                await adminCategoryApi.createCategory(data);
                toast.success("Category created successfully");
            }
            setIsModalOpen(false);
            fetchCategories();
            reset();
            setEditingCategory(null);
        } catch (error: any) {
            console.error("Error saving category:", error);
            const message = error.response?.data?.message || "Failed to save category";
            toast.error(message);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setValue('name', category.name);
        setValue('description', category.description);
        setValue('type', category.type);
        setValue('isBlocked', category.isBlocked);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await adminCategoryApi.deleteCategory(id);
            toast.success("Category deleted");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to delete category");
        }
    };

    const handleApprove = async (cat: Category) => {
        const message = prompt(`Approve category "${cat.name}"? Enter an optional message for the photographer:`, `Your category suggestion "${cat.name}" has been approved.`);
        if (message === null) return;

        try {
            await adminCategoryApi.approveCategory(cat._id, message);
            toast.success("Category approved and active");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to approve category");
        }
    };

    const handleReject = async (cat: Category) => {
        if (!confirm(`Discard suggestion "${cat.name}"? This will not block the name.`)) return;
        try {
            await adminCategoryApi.deleteCategory(cat._id);
            toast.success("Suggestion discarded");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to discard suggestion");
        }
    };



    const handleToggleStatus = async (cat: Category) => {
        try {
            const newStatus = cat.isActive === false;
            await adminCategoryApi.updateCategory(cat._id, { isActive: newStatus });
            toast.success(`Category ${newStatus ? 'activated' : 'deactivated'}`);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        {}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                            <p className="text-gray-500 mt-1">Manage standard categories and review suggestions.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link to={ROUTES.ADMIN.PENDING_CATEGORIES}>
                            <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-bold border border-gray-200 shadow-sm flex items-center gap-2 transition-all">
                                <Lightbulb size={20} className="text-yellow-600" />
                                Category Requests
                            </button>
                        </Link>
                        <button
                            onClick={openCreateModal}
                            className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-gray-900/10 flex items-center gap-2 transition-all"
                        >
                            <Plus size={20} /> Create Category
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                    <div className="inline-flex bg-gray-100/50 p-1.5 rounded-xl gap-1">
                        {[
                            { id: 'ALL', label: 'All', icon: Layers },
                            
                            
                            { id: 'BLOCKED', label: 'Blocked', icon: ShieldAlert },
                            { id: 'REQUESTS', label: 'Requests', icon: Lightbulb }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setFilterStatus(item.id as any); setPage(1); }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${filterStatus === item.id
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <item.icon size={16} className={filterStatus === item.id ? "text-gray-900" : "text-gray-400"} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        Found {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                    </div>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search categories..."
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
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Layers size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-700">No categories found</h3>
                                <p className="text-gray-400">Try adjusting your search or create a new one.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categories.map((cat) => (
                                    <motion.div
                                        key={cat._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row items-stretch md:items-center">
                                            {}
                                            <div className={`w-2 md:w-3 ${cat.isBlocked ? 'bg-red-500' : (cat.isActive === false ? 'bg-amber-400' : 'bg-green-500')}`} />

                                            <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
                                                {}
                                                <div className="flex items-center gap-5 flex-1 min-w-0 w-full md:w-auto">
                                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-100 transition-all shrink-0">
                                                        <Layers size={28} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-lg font-bold text-gray-900 truncate">{cat.name}</h3>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cat.isBlocked ? 'bg-red-50 text-red-600' :
                                                                (cat.isActive === false ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600')
                                                                }`}>
                                                                {cat.isSuggested ? 'Suggested' : (cat.isBlocked ? 'Blocked' : (cat.isActive === false ? 'Inactive' : 'Active'))}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wide">
                                                                {cat.type}
                                                            </span>
                                                            <span className="text-[11px] text-gray-300 font-medium">ID: {cat._id.slice(-6).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {}
                                                <div className="hidden lg:block flex-[1.5] min-w-0">
                                                    <p className="text-sm text-gray-500 line-clamp-2 italic leading-relaxed">
                                                        {cat.description}
                                                    </p>
                                                </div>

                                                {}
                                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                                    {cat.isSuggested ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApprove(cat)}
                                                                className="px-4 py-2.5 bg-[#2E7D46] hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                                            >
                                                                <Check size={16} /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(cat)}
                                                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                                                            >
                                                                Discard
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {}
                                                            <button
                                                                onClick={() => handleEdit(cat)}
                                                                className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(cat._id)}
                                                                className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
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
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-0"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCategory ? 'Edit Category' : 'Create Category'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                                    <input
                                        {...register("name", {
                                            required: "Name is required",
                                            minLength: { value: 3, message: "Name must be at least 3 characters" },
                                            validate: (value) => value.trim().length > 0 || "Name cannot be empty space"
                                        })}
                                        className={`w-full p-3 bg-gray-50 border rounded-lg focus:outline-none transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'}`}
                                        placeholder="e.g. Traditional Wedding"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                    <select {...register("type", { required: "Type is required" })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 transition-colors">
                                        {Object.values(CategoryType).map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                    <textarea
                                        {...register("description", {
                                            required: "Description is required",
                                            minLength: { value: 10, message: "Description must be at least 10 characters" },
                                            validate: (value) => value.trim().length >= 10 || "Description must be at least 10 characters (ignoring spaces)"
                                        })}
                                        className={`w-full p-3 bg-gray-50 border rounded-lg focus:outline-none h-24 resize-none transition-colors ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'}`}
                                        placeholder="Describe this category..."
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                                </div>

                                {editingCategory && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <input type="checkbox" {...register("isBlocked")} className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                                        <label className="text-sm font-medium text-gray-700">Block this category</label>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-bold text-white bg-gray-900 hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-gray-900/10 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                                        Save Category
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default CategoryManagement;
