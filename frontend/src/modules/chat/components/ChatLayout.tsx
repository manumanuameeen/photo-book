import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

const ChatLayout: React.FC = () => {
    const { initSocket, fetchConversations } = useChatStore();

    useEffect(() => {
        initSocket();
        fetchConversations();
    }, [initSocket, fetchConversations]);

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-100">
            
            <div className="w-full max-w-[1600px] mx-auto flex shadow-lg h-full">
                <div className="w-1/3 min-w-[320px] max-w-[420px] bg-white border-r">
                    <ChatSidebar />
                </div>
                <div className="flex-1 bg-[#e5ddd5] relative">
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;
