import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { useAuthStore } from "./modules/auth/store/useAuthStore"
import "./index.css"
const queryClient = new QueryClient()
const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const AppWrapper: React.FC = () => {
  const rehydrateUser = useAuthStore((state) => state.rehydrateUser)

  useEffect(() => {
    rehydrateUser()
  }, [rehydrateUser])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
)

export {router}
