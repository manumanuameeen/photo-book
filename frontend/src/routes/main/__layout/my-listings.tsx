import { createFileRoute } from '@tanstack/react-router'
import MyListings from '../../../modules/user/pages/MyListings'

export const Route = createFileRoute('/main/__layout/my-listings')({
    component: MyListings,
})
