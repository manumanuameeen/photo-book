import { createFileRoute } from '@tanstack/react-router'
import HomePage from '../../modules/auth/pages/user/Home'
export const Route = createFileRoute('/main/home')({
  component: HomePage,
})

