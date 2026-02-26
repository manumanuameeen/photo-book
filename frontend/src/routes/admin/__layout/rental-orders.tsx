import { createFileRoute } from '@tanstack/react-router'
import AdminRentalOrders from '../../../modules/admin/pages/AdminRentalOrders'

export const Route = createFileRoute('/admin/__layout/rental-orders')({
    component: AdminRentalOrders,
})
