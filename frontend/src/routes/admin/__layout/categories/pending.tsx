import { createFileRoute } from '@tanstack/react-router'
import PendingCategories from '../../../../modules/admin/pages/PendingCategories'

export const Route = createFileRoute('/admin/__layout/categories/pending')({
  component: PendingCategories,
})
