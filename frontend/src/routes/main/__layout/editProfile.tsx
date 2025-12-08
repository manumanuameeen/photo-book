import { createFileRoute } from '@tanstack/react-router'
import EditProfilePage from '../../../modules/user/pages/ProfileEdit'

export const Route = createFileRoute('/main/__layout/editProfile')({
  component: EditProfilePage,
})


