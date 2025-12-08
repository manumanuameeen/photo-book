import { createFileRoute } from '@tanstack/react-router';
import PendingApplications from '../../../../modules/admin/pages/PendingApplications';

export const Route = createFileRoute('/admin/__layout/applications/')({
    component: PendingApplications,
});
