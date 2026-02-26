import { createFileRoute } from '@tanstack/react-router'
import AdminRentalManagement from '../../../modules/admin/pages/AdminRentalManagement'

export const Route = createFileRoute('/admin/__layout/rental-management')({
    component: AdminRentalManagement,
})
