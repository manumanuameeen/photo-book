import { createFileRoute } from "@tanstack/react-router";
import Signup from "../../modules/auth/pages/Signup";

export const Route = createFileRoute("/auth/signup")({
  component: Signup,
});
