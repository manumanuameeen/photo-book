import { createFileRoute, redirect } from '@tanstack/react-router'
import PhotographerProfile from '../../../modules/photographer/pages/PhotographerProfile'
import { useAuthStore } from '../../../modules/auth/store/useAuthStore'
import { ROUTES } from '../../../constants/routes'
import toast from 'react-hot-toast';

export const Route = createFileRoute('/photographer/__layout/profile')({
  component: PhotographerProfile,
  beforeLoad: ({ location }) => {
    const { user, isAuthenticated } = useAuthStore.getState();
    const isPhotographer = user?.role === 'photographer';

   
    if (!isAuthenticated) {
      toast.error("Please login to access profile");
      throw redirect({
        to: ROUTES.AUTH.LOGIN,
        search: {
          redirect: location.href,
        },
      })
    }

    if (!isPhotographer) {
      toast.error("Access restricted to photographers.");
      throw redirect({
        to: ROUTES.USER.HOME
      });
    }
  },
})
