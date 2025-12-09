import { createFileRoute } from '@tanstack/react-router'
import PhotographerList from "../../../modules/user/pages/PhotographerList"
export const Route = createFileRoute('/main/__layout/photographer')({
  component: PhotographerList,
})

