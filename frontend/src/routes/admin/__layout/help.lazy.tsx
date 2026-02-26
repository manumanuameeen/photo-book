import { createLazyFileRoute } from '@tanstack/react-router';
import AdminHelpManagement from '../../../modules/admin/pages/AdminHelpManagement';

export const Route = createLazyFileRoute('/admin/__layout/help')({
    component: AdminHelpManagement,
});
