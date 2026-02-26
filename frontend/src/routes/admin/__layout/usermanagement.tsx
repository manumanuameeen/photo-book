import { createFileRoute } from '@tanstack/react-router';
import UserManagement from '../../../modules/admin/pages/UserManagement';

export const Route = createFileRoute('/admin/__layout/usermanagement')({
  component: UserManagement,
});