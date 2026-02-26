import { createFileRoute } from '@tanstack/react-router';
import RulesManagement from '../../../modules/admin/pages/RulesManagement';

export const Route = createFileRoute('/admin/__layout/rules')({
    component: RulesManagement,
});
