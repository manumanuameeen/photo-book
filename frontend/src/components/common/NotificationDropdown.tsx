import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, CheckCircle, Mail } from 'lucide-react';
import { messageApi } from '../../services/api/messageApi';
import type { SystemMessage } from '../../services/api/messageApi';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../constants/routes';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: messagesData, isLoading } = useQuery({
        queryKey: ['messages'],
        queryFn: () => messageApi.getMessages(1, 10),
        staleTime: 30000,
        refetchInterval: 60000
    });

    const messages = messagesData?.messages || [];
    const unreadCount = messages.filter(m => !m.isRead).length;

    const markAsReadMutation = useMutation({
        mutationFn: messageApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
        onError: () => toast.error("Failed to mark as read")
    });

    const deleteMutation = useMutation({
        mutationFn: messageApi.deleteMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            toast.success("Notification deleted");
        },
        onError: () => toast.error("Failed to delete")
    });

    const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        markAsReadMutation.mutate(id);
    };

    const handleDelete = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        deleteMutation.mutate(id);
    };

    const handleNotificationClick = (message: SystemMessage) => {
        if (!message.isRead) {
            markAsReadMutation.mutate(message.id);
        }

        if (message.content.includes('Reschedule')) {
            navigate({ to: ROUTES.USER.BOOKING });

        }
    };

    return (
        <div className="relative">
            <div
                className="p-2 text-gray-500 hover:text-gray-900 cursor-pointer relative transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} className={unreadCount > 0 ? "text-gray-900" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                )}
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 md:w-96 border rounded-xl shadow-xl py-2 z-50 bg-white border-gray-100 max-h-[500px] flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {isLoading ? (
                                <div className="p-8 text-center text-gray-400">
                                    <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    Loading...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                    <Mail size={32} className="mb-2 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div>
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            onClick={() => handleNotificationClick(msg)}
                                            className={`
                                                px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group
                                                ${!msg.isRead ? 'bg-blue-50/30' : ''}
                                            `}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!msg.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {msg.type === 'SYSTEM' ? 'System Message' : msg.senderName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mb-1 line-clamp-2">{msg.content}</p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!msg.isRead && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(msg.id, e)}
                                                            className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                                                            title="Mark as read"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDelete(msg.id, e)}
                                                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-bold text-gray-500 hover:text-gray-900"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
