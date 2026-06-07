import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Sidebar } from "./Sidebar.jsx"
import { Navbar } from "./Navbar.jsx"
import { useAuth } from "../lib/auth-context.jsx"

export function AppShell({ role }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true })
    } else if (user.role !== role) {
      navigate(user.role === "admin" ? "/admin" : "/customer", { replace: true })
    }
  }, [user, role, navigate])

  if (!user || user.role !== role) {
    return (
      <div className="d-flex min-vh-100 align-items-center justify-content-center">
        <p className="text-muted-2 small mb-0">Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="ag-app">
      <Sidebar />
      <div className="ag-main">
        <Navbar />
        <main className="ag-content flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
