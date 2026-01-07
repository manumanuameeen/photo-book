import { createFileRoute } from '@tanstack/react-router'
import PackageRequests from '../../../modules/admin/pages/PackageRequests'

export const Route = createFileRoute('/admin/__layout/packages')({
  component: PackageRequests,
})
