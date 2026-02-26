import { createLazyFileRoute } from '@tanstack/react-router';
import HowItWorks from '../../../modules/user/pages/HowItWorks';

export const Route = createLazyFileRoute('/main/__layout/how-it-works')({
    component: HowItWorks,
});
