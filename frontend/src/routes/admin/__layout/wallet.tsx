import { createFileRoute } from '@tanstack/react-router';
import AdminWallet from '../../../modules/admin/pages/AdminWallet';

export const Route = createFileRoute('/admin/__layout/wallet')({
    component: AdminWallet,
});
