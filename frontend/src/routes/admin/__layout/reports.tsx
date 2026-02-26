import { createFileRoute } from '@tanstack/react-router'
import ReportManagement from '../../../modules/admin/pages/ReportManagement'

export const Route = createFileRoute('/admin/__layout/reports')({
    component: ReportManagement,
})
