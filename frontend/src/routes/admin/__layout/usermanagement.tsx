import { createFileRoute } from '@tanstack/react-router';
import UserManagement from '../../../modules/admin/pages/userManagemnet';

export const Route = createFileRoute('/admin/__layout/usermanagement')({
  component: UserManagement,
});