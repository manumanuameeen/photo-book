import { createFileRoute } from '@tanstack/react-router'
import BookingWizard from '../../../modules/user/pages/Booking'

export const Route = createFileRoute('/main/__layout/booking')({
  component: BookingWizard,
})
