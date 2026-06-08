import { NavLink, Navigate, Outlet } from "react-router-dom"
import { LogOut } from "lucide-react"
import { Logo } from "./Logo.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import { navForRole } from "../lib/nav-config.js"

export function AppShell({ role }) {
  const { user, logout } = useAuth()

  if (!user) return <Navigate to="/" replace />
  if (user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/customer"} replace />

  const home = user.role === "admin" ? "/admin" : "/customer"

  return (
    <div className="min-vh-100 bg-light">
      <header className="bg-white border-bottom sticky-top">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
            <NavLink to={home} className="text-decoration-none text-dark">
              <Logo />
            </NavLink>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted d-none d-sm-inline">
                {user.name} ({user.role})
              </span>
              <button className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1" onClick={logout}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>

          <nav className="nav nav-pills flex-nowrap overflow-auto">
            {navForRole(user.role).map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === home}
                className={({ isActive }) => `nav-link text-nowrap ${isActive ? "active" : "text-dark"}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  )
}
