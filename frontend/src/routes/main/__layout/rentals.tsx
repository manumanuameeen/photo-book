import { createFileRoute } from '@tanstack/react-router'
import RentalMarketplace from '../../../modules/user/pages/RentalMarketplace'

export const Route = createFileRoute('/main/__layout/rentals')({
  component: RentalMarketplace,
})
