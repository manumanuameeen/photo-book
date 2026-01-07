import { createFileRoute } from '@tanstack/react-router'
import Packages from '../../../modules/photographer/pages/Packages'

export const Route = createFileRoute('/photographer/__layout/packages')({
  component: Packages,
})
