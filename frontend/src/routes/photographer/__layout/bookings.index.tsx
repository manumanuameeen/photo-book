import { createFileRoute } from '@tanstack/react-router'
import Bookings from '../../../modules/photographer/pages/Bookings'

export const Route = createFileRoute('/photographer/__layout/bookings/')({
  component: Bookings,
})
