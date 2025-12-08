import { createFileRoute } from '@tanstack/react-router'
import  ApplicationFormWrapper from '../../../modules/photographer/pages/ApplicationFormWrapper'

export const Route = createFileRoute('/photographer/__layout/apply')({
  component: ApplicationFormWrapper,
})

