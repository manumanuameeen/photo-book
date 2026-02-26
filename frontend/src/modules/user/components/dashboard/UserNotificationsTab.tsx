import { motion } from "framer-motion";
import { Bell, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { SystemMessage } from "../../../../services/api/messageApi";

interface UserNotificationsTabProps {
    messages: SystemMessage[];
    isLoading: boolean;
    onDelete: (id: string) => void;
    isDeleting: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const UserNotificationsTab = ({
    messages,
    isLoading,
    onDelete,
    isDeleting,
    page,
    totalPages,
    onPageChange
}: UserNotificationsTabProps) => {

    if (isLoading) {
        return <div className="text-center py-20 text-gray-500">Loading notifications...</div>;
    }

    return (
        <motion.div key="notifications" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-6">
            {messages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">No notifications</h3>
                    <p className="text-gray-500 text-sm">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map((msg: SystemMessage) => (
                        <div key={msg.id} className={`bg-white p-6 rounded-xl border ${msg.isRead ? 'border-gray-200' : 'border-green-200 bg-green-50'} shadow-sm hover:shadow-md transition-all flex gap-4`}>
                            <div className="flex-shrink-0">
                                <div className={`p-3 rounded-full ${msg.type === 'SYSTEM' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    <Bell size={20} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">{msg.senderName}</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                    <button
                                        onClick={() => onDelete(msg.id)}
                                        disabled={isDeleting}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        title="Delete message"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                    <span>{msg.fullDate}</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wide font-bold">{msg.type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">Page {page}</span>
                    <span>of</span>
                    <span className="font-medium text-gray-900">{totalPages}</span>
                </div>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </motion.div>
    );
};
