import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { router } from "./router";
import { queryClient } from "./lib/queryClient"

export  default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-center" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
// export { router };