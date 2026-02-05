import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { router } from "./router";
import { queryClient } from "./lib/queryClient"
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { useAuthStore } from "./modules/auth/store/useAuthStore";
import { socketService } from "./modules/chat/services/socketService";

export default function App() {
  const { rehydrateUser, user } = useAuthStore();

  useEffect(() => {
    rehydrateUser();
  }, [rehydrateUser]);

  // Global Socket Connection & Notification Listener
  useEffect(() => {
    if (user?._id) {
      socketService.connect();

      const handleNewMessage = (data: any) => {
        // Only show toast if NOT on the chat page
        if (!window.location.href.includes('/chat')) {
          const senderName = data.senderId?.name || 'Someone';
          toast.success(`New message from ${senderName}`, {
            description: data.content || 'Sent a photo/attachment',
            duration: 4000,
            action: {
              label: 'View',
              onClick: () => window.location.href = `/chat?userId=${data.senderId?._id || data.senderId}`
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
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
