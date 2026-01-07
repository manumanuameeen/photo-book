import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/main/__layout/payment/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/main/__layout/payment/$id"!</div>
}
