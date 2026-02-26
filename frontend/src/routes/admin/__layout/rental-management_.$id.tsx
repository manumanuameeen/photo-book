import { createFileRoute } from '@tanstack/react-router';
import AdminRentalDetails from '../../../modules/admin/pages/AdminRentalDetails';

export const Route = createFileRoute('/admin/__layout/rental-management_/$id')({
    component: AdminRentalDetails,
});
