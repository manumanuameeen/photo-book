import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Package,
    MessageCircle,
    ShieldAlert,
    ArrowRight,
    Star,
    CheckCircle2,
    HelpCircle,
    PlusCircle,
    X
} from 'lucide-react';
import { helpApi, type IHelpContent } from '../../../services/api/helpApi';
import { helpRequestApi } from '../../../services/api/helpRequestApi';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from "../../../constants/routes"

const iconMap: Record<string, React.ReactNode> = {
    booking: <Camera className="w-8 h-8" />,
    rental: <Package className="w-8 h-8" />,
    chat: <MessageCircle className="w-8 h-8" />,
    report: <ShieldAlert className="w-8 h-8" />,
};

const categoryColors: Record<string, string> = {
    booking: "from-blue-500 to-indigo-600",
    rental: "from-purple-500 to-pink-600",
    chat: "from-green-500 to-teal-600",
    report: "from-orange-500 to-red-600",
};

export default function HowItWorks() {

    const navigate = useNavigate()
    const [content, setContent] = useState<IHelpContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("booking");

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestTopic, setRequestTopic] = useState("");
    const [requestDesc, setRequestDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await helpRequestApi.submitRequest({ topic: requestTopic, description: requestDesc });
            toast.success("Thank you! Your suggestion has been sent to our team.");
            setIsRequestModalOpen(false);
            setRequestTopic("");
            setRequestDesc("");
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to send request. please try again.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await helpApi.getAllHelp();
                setContent(data);
                if (data.length > 0) setActiveTab(data[0].category);
            } catch (error) {
                console.error("Failed to fetch help content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <HelpCircle size={48} className="text-green-500" />
                </motion.div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading amazing guides...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-green-100 selection:text-green-900">
            <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-50/50 via-transparent to-transparent opacity-70" />

                <div className="relative max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-semibold mb-6"
                    >
                        <Star size={16} fill="currentColor" />
                        <span>Master the Platform</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight"
                    >
                        How it <span className="text-green-600 italic">Works.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed"
                    >
                        Everything you need to know about booking photographers, renting gear,
                        and growing your creative business on Photo-Book.
                    </motion.p>
                </div>
            </section>

            <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-y border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
                    <div className="flex justify-center items-center py-4 gap-4 min-w-max">
                        {content.map((section) => (
                            <button
                                key={section._id}
                                onClick={() => setActiveTab(section.category)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${activeTab === section.category
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                    : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                {iconMap[section.category] || <HelpCircle className="w-8 h-8" />}
                                <span className="capitalize">{section.category}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {content
                        .filter((s) => s.category === activeTab)
                        .map((section) => (
                            <motion.div
                                key={section._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-12"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8 md:text-left text-center">
                                    <div className={`p-6 rounded-3xl bg-gradient-to-br ${categoryColors[section.category] || "from-slate-500 to-slate-600"} text-white shadow-2xl`}>
                                        {iconMap[section.category] || <HelpCircle className="w-8 h-8" />}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-4xl font-bold text-slate-900 mb-4 capitalize">{section.title}</h2>
                                        <p className="text-lg text-slate-600 max-w-3xl">{section.description}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                                    {section.steps.sort((a, b) => a.order - b.order).map((step, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -5 }}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-green-100/40 transition-all flex flex-col h-full relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <span className="text-8xl font-black text-slate-900 tracking-tighter">0{idx + 1}</span>
                                            </div>

                                            <div className="relative">
                                                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-50 text-slate-900 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                                <p className="text-slate-600 leading-relaxed text-sm">{step.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                            </motion.div>
                        ))}
                </AnimatePresence>
            </main>

            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {content.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsRequestModalOpen(true)}
                            className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 text-white font-bold shadow-2xl hover:bg-slate-800 transition-all text-sm border border-slate-700"
                        >
                            <span>Suggest a Topic</span>
                            <PlusCircle size={18} />
                        </motion.button>
                    )}
                </AnimatePresence>

            </div>

            <AnimatePresence>
                {isRequestModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRequestModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900">Suggest a Help Topic</h3>
                                <button onClick={() => setIsRequestModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleRequestSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">What's missing?</label>
                                    <input
                                        required
                                        value={requestTopic}
                                        onChange={(e) => setRequestTopic(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all font-medium"
                                        placeholder="e.g. How to export photos"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">Brief Description</label>
                                    <textarea
                                        required
                                        value={requestDesc}
                                        onChange={(e) => setRequestDesc(e.target.value)}
                                        rows={4}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all font-medium resize-none"
                                        placeholder="Tell us what you'd like to see explained..."
                                    />
                                </div>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                                >
                                    {isSubmitting ? "Sending..." : (
                                        <>
                                            Submit Suggestion
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <footer className="py-24 px-4 bg-slate-50 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8">Ready to capture memories?</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                        Browse Photographers <ArrowRight size={20} onClick={() => navigate({ to: ROUTES.USER.PHOTOGRAPHER })} />

                    </button>

                </div>
            </footer>
        </div>
    );
}
