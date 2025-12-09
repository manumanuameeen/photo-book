import { createFileRoute } from '@tanstack/react-router'
import AdminPhotogrpherProfile from "../../modules/admin/pages/AdminPhotographerProfile"
export const Route = createFileRoute('/admin/photographers/$id')({
  component: AdminPhotogrpherProfile,
})
