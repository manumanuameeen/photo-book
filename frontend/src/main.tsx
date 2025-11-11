import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { useAuthStore } from "./modules/auth/store/useAuthStore"
import {router} from "./router"
import "./index.css"
const queryClient = new QueryClient()



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
