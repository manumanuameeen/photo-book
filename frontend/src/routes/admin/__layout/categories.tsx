import { createFileRoute } from '@tanstack/react-router'
import CategoryManagement from '../../../modules/admin/pages/CategoryManagement'

export const Route = createFileRoute('/admin/__layout/categories')({
  component: CategoryManagement,
})
