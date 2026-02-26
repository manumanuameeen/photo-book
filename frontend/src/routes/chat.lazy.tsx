import { createLazyFileRoute } from '@tanstack/react-router'
import ChatPage from '../modules/chat/pages/ChatPage'

export const Route = createLazyFileRoute('/chat')({
    component: ChatPage,
})
