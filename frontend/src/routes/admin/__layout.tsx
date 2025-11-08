import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/__layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>heloo</div>
}
