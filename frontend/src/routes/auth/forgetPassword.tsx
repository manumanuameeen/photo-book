import { createFileRoute } from '@tanstack/react-router'
import ForgotPassword from '../../modules/auth/pages/auth/ForgetPassword'
export const Route = createFileRoute('/auth/forgetPassword')({
  component: ForgotPassword,
})

