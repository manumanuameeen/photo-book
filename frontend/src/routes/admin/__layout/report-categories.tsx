import { createFileRoute } from '@tanstack/react-router'
import ReportCategoryManagent from "../../../modules/admin/pages/ReportCategoriesManagement"
export const Route = createFileRoute('/admin/__layout/report-categories')({
  component: ReportCategoryManagent,
})

