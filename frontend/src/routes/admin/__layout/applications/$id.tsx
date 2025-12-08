import { createFileRoute } from '@tanstack/react-router';
import ApplicationDetails from '../../../../modules/admin/pages/ApplicationDetails';

export const Route = createFileRoute('/admin/__layout/applications/$id')({
    component: ApplicationDetails,
});
