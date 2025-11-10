import { createFileRoute } from "@tanstack/react-router";
import HomePage from "../../modules/user/Home";

export const Route = createFileRoute("/main/home")({
  component: HomePage,
  
});
