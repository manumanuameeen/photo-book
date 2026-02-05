import { createFileRoute } from '@tanstack/react-router'

import { PaymentSuccessPage } from '../../../modules/user/pages/PaymentSuccessPage'

export const Route = createFileRoute('/main/__layout/payment/success')({
  component: PaymentSuccessPage,
})
