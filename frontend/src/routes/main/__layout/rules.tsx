import { createFileRoute } from '@tanstack/react-router';
import RulesPage from '../../../modules/user/pages/RulesPage';

export const Route = createFileRoute('/main/__layout/rules')({
    component: RulesPage,
});
