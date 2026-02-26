import { createFileRoute } from '@tanstack/react-router'
import RentalDetails from '../../../modules/user/pages/RentalDetails'

export const Route = createFileRoute('/main/__layout/rentals_/$id')({
  component: RentalDetails,
})
