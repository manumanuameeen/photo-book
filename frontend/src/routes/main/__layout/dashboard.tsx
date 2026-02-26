import { createFileRoute } from '@tanstack/react-router'
import UserDashboard from '../../../modules/user/pages/UserDashboard'

export const Route = createFileRoute('/main/__layout/dashboard')({
    component: UserDashboard,
})
