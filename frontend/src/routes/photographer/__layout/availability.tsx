import { createFileRoute } from '@tanstack/react-router'
import AvailabilityPage from '../../../modules/photographer/pages/AvailabilityPage'

export const Route = createFileRoute('/photographer/__layout/availability')({
  component: AvailabilityPage,
})
