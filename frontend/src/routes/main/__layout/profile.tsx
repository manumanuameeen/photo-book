import { createFileRoute } from '@tanstack/react-router'
import Profile from "../../../modules/user/pages/Profile"


export const Route = createFileRoute('/main/__layout/profile')({
  component: Profile,
})
