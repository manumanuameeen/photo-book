import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/main/__layout/booking')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/main/__layout/booking"!</div>
}
