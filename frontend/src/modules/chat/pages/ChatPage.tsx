import React, { useEffect } from 'react';
import ChatLayout from '../components/ChatLayout';
import { useSearch } from '@tanstack/react-router';
import { useChatStore } from '../store/useChatStore';
import Header from '../../../layouts/user/Header';
import Footer from '../../../layouts/user/Footer';

const ChatPage: React.FC = () => {
    const search: { userId?: string } = useSearch({ strict: false });
    const { setSelectedUser } = useChatStore();

    useEffect(() => {
        if (search.userId) {

            setSelectedUser({
                _id: search.userId,
                firstName: 'User',
                lastName: search.userId.slice(-4),
                email: '',
                profileImage: ''
            });
        }
    }, [search.userId, setSelectedUser]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 w-full relative">
                <ChatLayout />
            </div>
            <Footer />
        </div>
    );
};

export default ChatPage;
