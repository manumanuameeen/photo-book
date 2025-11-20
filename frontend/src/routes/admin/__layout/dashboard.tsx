import { createFileRoute } from '@tanstack/react-router';
import DashboardLayout from '../../../modules/admin/pages/dashBoard';

export const Route = createFileRoute('/admin/__layout/dashboard')({
  component: DashboardLayout,
});