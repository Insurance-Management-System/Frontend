import { useNavigate, useLocation, NavLink, Link } from "react-router-dom"
import { Bell, LogOut, Menu, Settings, UserCircle } from "lucide-react"
import { Logo } from "./Logo.jsx"
import { Avatar } from "./Avatar.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import { useData } from "../lib/data-context.jsx"
import { navForRole } from "../lib/nav-config.js"

export function Navbar() {
  const { user, logout } = useAuth()
  const { notifications } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  if (!user) return null

  const items = navForRole(user.role)
  const roleHome = user.role === "admin" ? "/admin" : "/customer"

  function handleLogout() {
    logout()
    navigate("/")
  }

  return (
    <header className="ag-navbar d-flex align-items-center justify-content-between px-3 px-md-4">
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-link text-dark p-1 d-md-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileNav"
          aria-label="Open navigation"
        >
            <Menu size={22} />
        </button>
        <span className="d-none d-md-inline text-muted-2 small fw-medium">{user.role === "admin" ? "Admin Console" : "Customer Portal"}</span>
        <div className="d-md-none">
          <Logo showText={false} />
        </div>
      </div>

      <div className="d-flex align-items-center gap-1">
        <div className="dropdown">
          <button
            className="btn btn-link text-dark p-2 position-relative"
            type="button"
            data-bs-toggle="dropdown"
            data-bs-auto-close="outside"
            aria-expanded="false"
            aria-label="Notifications">
            <Bell size={20} />
            <span className="position-absolute translate-middle p-1 bg-danger rounded-circle" style={{ top: 10, right: 6 }}>
              <span className="visually-hidden">new notifications</span>
            </span>
          </button>
          <div className="dropdown-menu dropdown-menu-end p-0" style={{ width: 320 }}>
            <div className="d-flex align-items-center justify-content-between px-3 py-2">
              <span className="fw-semibold small">Notifications</span>
              <span className="ag-badge ag-badge-type">{notifications.length} new</span>
            </div>
            <hr className="my-0" />
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="px-3 py-2 border-bottom">
                  <div className="small fw-medium">{n.title}</div>
                  <div className="text-muted-2" style={{ fontSize: "0.78rem" }}>
                    {n.message}
                  </div>
                </div>
              ))}
            </div>
            <Link to={user.role === "admin" ? "/admin/notifications" : "/customer/notifications"} className="d-block text-center small py-2 text-primary">
              View all
            </Link>
          </div>
        </div>

        <div className="dropdown">
          <button
            className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 px-2"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <Avatar name={user.name} size={34} primary />
            <span className="d-none d-sm-inline small fw-medium">{user.name}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end" style={{ width: 224 }}>
            <li className="px-3 py-2">
              <div className="fw-medium small">{user.name}</div>
              <div className="text-muted-2" style={{ fontSize: "0.78rem" }}>
                {user.email}
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <Link className="dropdown-item d-flex align-items-center gap-2" to={user.role === "admin" ? "/admin/settings" : "/customer/profile"}>
                <UserCircle size={16} /> Profile
              </Link>
            </li>
            {user.role === "admin" && (<li><Link className="dropdown-item d-flex align-items-center gap-2" to="/admin/settings">\<Settings size={16} /> Settings
                </Link>
              </li>
            )}
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="offcanvas offcanvas-start" tabIndex={-1} id="mobileNav" aria-labelledby="mobileNavLabel">
        <div className="offcanvas-header border-bottom">
          <Logo />
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body">
          <nav className="d-flex flex-column gap-1">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === roleHome}
                  data-bs-dismiss="offcanvas"
                  className="ag-nav-link"
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
