import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, ShieldCheck, Users } from "lucide-react"
import { Logo } from "../components/Logo.jsx"
import { useAuth } from "../lib/auth-context.jsx"

const demoEmails = {
  admin: "admin@insure.com",
  customer: "vrushabh@gmail.com",
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState("admin")
  const [email, setEmail] = useState(demoEmails.admin)
  const [password, setPassword] = useState("demo1234")

  function selectRole(nextRole) {
    setRole(nextRole)
    setEmail(demoEmails[nextRole])
  }

  function handleSubmit(e) {
    e.preventDefault()
    const user = login(email, role)
    navigate(user.role === "admin" ? "/admin" : "/customer")
  }

  return (
    <main className="min-vh-100 bg-light d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center align-items-stretch g-0">
          <section className="col-lg-5 bg-primary text-white p-4 p-md-5 rounded-start">
            <Logo light />
            <div className="my-5">
              <h1 className="h2 fw-semibold mb-3">Insurance Management System</h1>
              <p className="mb-0 text-white-50">
                 Manage policies, claims, customers, payments and notifications all in one place.
              </p>
            </div>
            <p className="small text-white-50 mb-0">CDAC PROJECT</p>
          </section>

          <section className="col-lg-5 bg-white p-4 p-md-5 rounded-end shadow-sm">
            <h2 className="h4 fw-semibold mb-1">Login</h2>
            <p className="text-muted small mb-4">Choose a role and continue with demo data.</p>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <RoleOption
                  active={role === "admin"}
                  icon={<ShieldCheck size={20} />}
                  label="Admin"
                  onClick={() => selectRole("admin")}
                />
              </div>
              <div className="col-6">
                <RoleOption
                  active={role === "customer"}
                  icon={<Users size={20} />}
                  label="Customer"
                  onClick={() => selectRole("customer")}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label htmlFor="email" className="form-label small fw-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label small fw-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                Sign in <ArrowRight size={16} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}

function RoleOption({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      className={`btn w-100 border d-flex flex-column align-items-center py-3 ${
        active ? "btn-primary text-white" : "btn-light"
      }`}
      onClick={onClick}
    >
      <span className={active ? "text-white" : "text-muted"}>{icon}</span>
      <span className="d-block fw-semibold small mt-2">{label}</span>
    </button>
  )
}
