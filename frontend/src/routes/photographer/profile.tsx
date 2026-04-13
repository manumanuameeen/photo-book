import { createFileRoute, redirect } from '@tanstack/react-router'
import PhotographerProfile from '../../modules/photographer/pages/PhotographerProfile'
import { useAuthStore } from '../../modules/auth/store/useAuthStore'
import { ROUTES } from '../../constants/routes'
import { toast } from 'sonner';

export const Route = createFileRoute('/photographer/profile')({
  component: PhotographerProfile,
  beforeLoad: ({ location }) => {
    const { user, isAuthenticated, isVerified } = useAuthStore.getState();
    const isPhotographer = user?.role === 'photographer';

    
    if (!isAuthenticated || !isVerified) {
      toast.error("Please login to access profile", { id: "auth-required" });
      throw redirect({
        to: ROUTES.AUTH.LOGIN,
        search: {
          redirect: location.href,
        },
      })
    }

    if (!isPhotographer) {
      toast.error("Access restricted to photographers.", { id: "access-denied" });
      throw redirect({
        to: ROUTES.USER.HOME
      });
    }
  },
})
