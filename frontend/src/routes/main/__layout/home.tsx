import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/main/__layout/home")({
  loader: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

