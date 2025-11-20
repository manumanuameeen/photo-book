import { createFileRoute } from '@tanstack/react-router'
import VerifyResetOtp from '../../modules/auth/pages/auth/VerifyResetOtp'

export const Route = createFileRoute('/auth/reset-otp')({
  component: VerifyResetOtp,
})


