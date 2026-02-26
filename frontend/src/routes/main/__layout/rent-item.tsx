import { createFileRoute } from '@tanstack/react-router'
import RentItemWizard from '../../../modules/user/pages/RentItemWizard'

export const Route = createFileRoute('/main/__layout/rent-item')({
    component: RentItemWizard,
})
