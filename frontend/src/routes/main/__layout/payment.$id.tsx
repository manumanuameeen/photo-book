import { createFileRoute } from '@tanstack/react-router'
import { PaymentPage } from '../../../modules/user/pages/PaymentPage'

export const Route = createFileRoute('/main/__layout/payment/$id')({
  component: PaymentPage,
})
