import { createFileRoute } from '@tanstack/react-router';
import AdminReviewManagement from '../../../modules/admin/pages/ReviewManagement';

export const Route = createFileRoute('/admin/__layout/reviews')({
    component: AdminReviewManagement,
});
