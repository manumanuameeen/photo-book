import { createFileRoute } from "@tanstack/react-router";
import HomePage from "../../../modules/user/pages/Home";

export const Route = createFileRoute("/main/__layout/home")({
  component: HomePage,
  
});
