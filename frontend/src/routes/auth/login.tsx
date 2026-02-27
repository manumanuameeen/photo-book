import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "../../modules/auth/pages/auth/LoginPage";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
});