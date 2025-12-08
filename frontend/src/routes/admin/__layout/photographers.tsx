import { createFileRoute } from '@tanstack/react-router'
import PhtographerMangment from "../../../modules/admin/pages/PhotographerManagement"
export const Route = createFileRoute('/admin/__layout/photographers')({
  component: PhtographerMangment,
})

