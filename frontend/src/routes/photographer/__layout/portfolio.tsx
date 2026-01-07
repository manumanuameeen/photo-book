import { createFileRoute } from '@tanstack/react-router'
import PortfolioManager from '../../../modules/photographer/pages/PortfolioManager'

export const Route = createFileRoute('/photographer/__layout/portfolio')({
  component: PortfolioManager,
})
