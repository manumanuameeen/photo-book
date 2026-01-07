import { createFileRoute } from '@tanstack/react-router'
import PhotographerDetails from "../../../modules/user/pages/PhotographerDetails"

export const Route = createFileRoute('/main/__layout/photographer_/$id')({
  component: PhotographerDetails,
})
