import { createFileRoute } from '@tanstack/react-router'
import EditProfilePage from '../../../modules/user/pages/ProfileEdit'

export const Route = createFileRoute('/photographer/__layout/edit-profile')({
  component: EditProfilePage,
})
