import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import AdminHeader from '../../layouts/admin/AdminHeader.tsx'
import AdminSidebar from '../../layouts/admin/AdminSIdeBar.tsx'
import { useAuthStore } from '../../modules/auth/store/useAuthStore'

export const Route = createFileRoute('/admin/__layout')({

  beforeLoad: async ({ location }) => {
    const { rehydrateUser, user } = useAuthStore.getState();
    if (!user) {
      await rehydrateUser();
    }

    const currentState = useAuthStore.getState();

    if (!currentState.isAuthenticated || !currentState.user) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      });
    }

    if (currentState.user.role !== "admin") {
      throw redirect({
        to: "/auth/login",

      })
    }
  }, component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

