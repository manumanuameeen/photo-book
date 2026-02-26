import { createFileRoute } from '@tanstack/react-router'
import AdminRentalOrderDetails from '../../../modules/admin/pages/AdminRentalOrderDetails'
export const Route = createFileRoute('/admin/__layout/rental-orders_/$orderId')(
  {
    component: AdminRentalOrderDetails,
  },
)

