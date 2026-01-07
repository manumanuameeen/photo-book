import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/photographer/__layout/bookings')({
  component: () => <Outlet />,
});
