import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { router } from "./router";
import { queryClient } from "./lib/queryClient"
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { useAuthStore } from "./modules/auth/store/useAuthStore";
import { socketService } from "./modules/chat/services/socketService";
import AIChatbot from "./components/common/AIChatbot";

export default function App() {
  const { rehydrateUser, user } = useAuthStore();

  useEffect(() => {
    rehydrateUser();
  }, [rehydrateUser]);

  useEffect(() => {
    if (user?._id) {
      socketService.connect();

      interface NewMessageData {
        senderId?: string | { name?: string; _id?: string };
        content?: string;
      }
      const handleNewMessage = (data: unknown) => {
        const messageData = data as NewMessageData;
        if (!window.location.href.includes('/chat')) {
          let senderName = 'Someone';
          let senderIdValue = '';

          if (messageData.senderId) {
            if (typeof messageData.senderId === 'string') {
              senderIdValue = messageData.senderId;
            } else {
              senderName = messageData.senderId.name || 'Someone';
              senderIdValue = messageData.senderId._id || '';
            }
          }

          toast.success(`New message from ${senderName}`, {
            description: messageData.content || 'Sent a photo/attachment',
            duration: 4000,
            action: {
              label: 'View',
              onClick: () => window.location.href = `/chat?userId=${senderIdValue}`
            }
          });
        }
      };

      socketService.on('new_message', handleNewMessage);

      return () => {
        socketService.off('new_message', handleNewMessage);
        socketService.disconnect();
      };
    }
  }, [user]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-center" />
        <RouterProvider router={router} context={{ auth: useAuthStore.getState() }} />
        <AIChatbot />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
