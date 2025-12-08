import { createFileRoute } from '@tanstack/react-router'
import PhotoDashbord from '../../../modules/photographer/pages/PhotographerDashboard'
export const Route = createFileRoute('/photographer/__layout/dashboard')({
  component: PhotoDashbord,
})


