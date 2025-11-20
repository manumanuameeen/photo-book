import { createFileRoute } from '@tanstack/react-router'
import ResetPassword from '../../modules/auth/pages/auth/reset-password'
export const Route = createFileRoute('/auth/resetPassword')({
  component: ResetPassword,
})


