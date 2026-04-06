import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    GripVertical,
    Layout,
    PlusCircle,
} from 'lucide-react';
import { helpApi, type IHelpContent } from '../../../services/api/helpApi';
import { helpRequestApi, type IHelpTopicRequest } from '../../../services/api/helpRequestApi';
import { toast } from 'sonner';
import { MessageSquare, Check, Hourglass } from 'lucide-react';

export default function AdminHelpManagement() {
    const [sections, setSections] = useState<IHelpContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<IHelpContent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'requests'>('content');
    const [requests, setRequests] = useState<IHelpTopicRequest[]>([]);

    const [contentPage, setContentPage] = useState(1);
    const [requestsPage, setRequestsPage] = useState(1);
    const itemsPerPage = 5;

    const fetchSections = async () => {
        try {
            const [sectionsData, requestsData] = await Promise.all([
                helpApi.getAllHelp(),
                helpRequestApi.getAllRequests()
            ]);
            setSections(sectionsData);
            setRequests(requestsData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSection) return;

        try {
            
            const sanitizedSection = structuredClone(editingSection);

            if (!sanitizedSection._id) {
                delete (sanitizedSection as { _id?: string })._id;
            }

            sanitizedSection.steps = sanitizedSection.steps.filter(step => step.title.trim() !== "");

            if (editingSection._id) {
                await helpApi.updateHelpSection(editingSection._id, sanitizedSection);
                toast.success("Section updated!");
            } else {
                await helpApi.createHelpSection(sanitizedSection);
                toast.success("Section created!");
            }
            setIsModalOpen(false);
            fetchSections();
        } catch (error: unknown) {
            console.error("Operation failed:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!globalThis.confirm("Are you sure?")) return;
        try {
            await helpApi.deleteHelpSection(id);
            toast.success("Deleted successfully");
            fetchSections();
        } catch (error: unknown) {
            console.error("Delete failed:", error);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await helpRequestApi.updateStatus(id, status);
            toast.success(`Request marked as ${status}`);
            fetchSections();
        } catch (error: unknown) {
            console.error("Update failed:", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help System <span className="text-green-600">Admin</span></h1>
                    <p className="text-slate-500 font-medium">Manage the guides that help our users succeed.</p>
                </div>
                {activeTab === 'content' && (
                    <button
                        onClick={() => {
                            setEditingSection({
                                _id: "",
                                title: "",
                                description: "",
                                category: "booking",
                                icon: "Camera",
                                order: 0,
                                steps: [],
                                isActive: true,
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-200"
                    >
                        <Plus size={20} />
                        New Category
                    </button>
                )}
            </div>

            <div className="flex gap-4 border-b border-slate-200 pb-2">
                <button
                    onClick={() => { setActiveTab('content'); setContentPage(1); }}
                    className={`px-6 py-3 font-bold rounded-xl transition-all ${activeTab === 'content' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Help Content
                </button>
                <button
                    onClick={() => { setActiveTab('requests'); setRequestsPage(1); }}
                    className={`px-6 py-3 font-bold rounded-xl transition-all relative ${activeTab === 'requests' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Topic Requests
                    {requests.filter(r => r.status === 'pending').length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                            {requests.filter(r => r.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'content' ? (
                <div className="grid gap-6">
                    {sections.slice((contentPage - 1) * itemsPerPage, contentPage * itemsPerPage).map((section) => (
                        <motion.div
                            layout
                            key={section._id}
                            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                        >
                            <div className="p-6 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                                        <Layout size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 capitalize italic">{section.title}</h2>
                                        <p className="text-slate-500 text-sm overflow-hidden text-ellipsis max-w-md whitespace-nowrap">{section.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingSection(structuredClone(section));
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(section._id)}
                                        className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 pb-6 pt-2">
                                <div className="flex flex-wrap gap-2">
                                    {section.steps.sort((a, b) => a.order - b.order).map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                            <span>{step.order + 1}. {step.title}</span>
                                        </div>
                                    ))}
                                    {section.steps.length === 0 && <span className="text-xs text-slate-400 italic">No steps added yet.</span>}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => setContentPage(p => Math.max(1, p - 1))}
                            disabled={contentPage === 1}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-bold text-slate-500">
                            Page {contentPage} of {Math.max(1, Math.ceil(sections.length / itemsPerPage))}
                        </span>
                        <button
                            onClick={() => setContentPage(p => Math.min(Math.ceil(sections.length / itemsPerPage), p + 1))}
                            disabled={contentPage >= Math.ceil(sections.length / itemsPerPage) || sections.length === 0}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {requests.slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage).map((req) => (
                        <motion.div
                            layout
                            key={req._id}
                            className={`bg-white rounded-3xl border ${req.status === 'pending' ? 'border-amber-200 shadow-amber-50' : 'border-slate-100'} shadow-sm p-6 flex flex-col gap-4`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{req.topic}</h3>
                                        <p className="text-slate-500 text-sm font-medium">Requested by: <span className="text-slate-900">{req.user.name}</span> ({req.user.email})</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {req.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(req._id, 'reviewed')}
                                            className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm hover:bg-green-100 transition-all flex items-center gap-2"
                                        >
                                            <Check size={16} /> Mark Reviewed
                                        </button>
                                    )}
                                    {req.status === 'reviewed' && (
                                        <button
                                            onClick={() => {
                                                setEditingSection({
                                                    _id: "",
                                                    title: req.topic,
                                                    description: req.description,
                                                    category: "booking",
                                                    icon: "Camera",
                                                    order: sections.length,
                                                    steps: [],
                                                    isActive: true,
                                                });
                                                setActiveTab('content');
                                                setIsModalOpen(true);
                                            }}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
                                        >
                                            <Plus size={16} /> Create Content
                                        </button>
                                    )}
                                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${req.status === 'implemented' ? 'bg-green-100 text-green-700' :
                                        req.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {req.status === 'pending' ? <Hourglass size={12} /> : <Check size={12} />}
                                        {req.status}
                                    </div>
                                </div>
                            </div>
                            <p className="bg-slate-50 p-4 rounded-2xl text-slate-600 text-sm italic border border-slate-100">
                                "{req.description}"
                            </p>
                        </motion.div>
                    ))}
                    {requests.length === 0 && (
                        <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">No suggestions yet.</h3>
                        </div>
                    )}

                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => setRequestsPage(p => Math.max(1, p - 1))}
                            disabled={requestsPage === 1}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-bold text-slate-500">
                            Page {requestsPage} of {Math.max(1, Math.ceil(requests.length / itemsPerPage))}
                        </span>
                        <button
                            onClick={() => setRequestsPage(p => Math.min(Math.ceil(requests.length / itemsPerPage), p + 1))}
                            disabled={requestsPage >= Math.ceil(requests.length / itemsPerPage) || requests.length === 0}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={handleCreateOrUpdate}>
                                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-6 border-b border-slate-100 flex justify-between items-center z-10">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {editingSection?._id ? "Edit Section" : "Launch New Category"}
                                    </h3>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-10 space-y-10">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-1">Display Title</label>
                                                <input
                                                    required
                                                    value={editingSection?.title}
                                                    onChange={(e) => setEditingSection(prev => prev ? { ...prev, title: e.target.value } : null)}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all font-medium text-slate-900"
                                                    placeholder="e.g. Master the Booking Flow"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-1">Category Key</label>
                                                <input
                                                    required
                                                    value={editingSection?.category}
                                                    onChange={(e) => setEditingSection(prev => prev ? { ...prev, category: e.target.value } : null)}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all font-medium text-slate-900"
                                                    placeholder="e.g. booking, rental, or a new category"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-1">Teaser Description</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={editingSection?.description}
                                                onChange={(e) => setEditingSection(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all font-medium text-slate-900 resize-none h-full"
                                                placeholder="Explain what users will learn here..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                                <GripVertical size={20} className="text-slate-300" />
                                                Guided Workflow Steps
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSteps = [...(editingSection?.steps || [])];
                                                    newSteps.push({ title: "", description: "", order: newSteps.length });
                                                    setEditingSection(prev => prev ? { ...prev, steps: newSteps } : null);
                                                }}
                                                className="flex items-center gap-2 text-green-600 font-bold hover:text-green-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-green-50"
                                            >
                                                <PlusCircle size={18} />
                                                Add Step
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {editingSection?.steps.sort((a, b) => a.order - b.order).map((step, idx) => (
                                                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
                                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-4 border-slate-50">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="grid md:grid-cols-12 gap-4">
                                                        <div className="md:col-span-11 space-y-4">
                                                            <input
                                                                placeholder="Step Phase Title"
                                                                value={step.title}
                                                                onChange={(e) => {
                                                                    const newSteps = [...(editingSection?.steps || [])];
                                                                    newSteps[idx].title = e.target.value;
                                                                    setEditingSection(prev => prev ? { ...prev, steps: newSteps } : null);
                                                                }}
                                                                className="w-full text-sm font-bold text-slate-900 border-none p-0 focus:ring-0 placeholder:text-slate-300"
                                                            />
                                                            <textarea
                                                                placeholder="Deep dive into this step..."
                                                                rows={2}
                                                                value={step.description}
                                                                onChange={(e) => {
                                                                    const newSteps = [...(editingSection?.steps || [])];
                                                                    newSteps[idx].description = e.target.value;
                                                                    setEditingSection(prev => prev ? { ...prev, steps: newSteps } : null);
                                                                }}
                                                                className="w-full text-xs text-slate-500 border-none p-0 focus:ring-0 resize-none h-auto placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-1 flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newSteps = editingSection?.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })) || [];
                                                                    setEditingSection(prev => prev ? { ...prev, steps: newSteps } : null);
                                                                }}
                                                                className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3"
                                        >
                                            <Save size={20} />
                                            Publish Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-8 py-5 rounded-[1.5rem] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
