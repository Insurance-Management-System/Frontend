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
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState("admin")
  const [email, setEmail] = useState(demoEmails.admin)
  const [password, setPassword] = useState("demo1234")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mode, setMode] = useState("login")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")

  function selectRole(nextRole) {
    setRole(nextRole)
    setEmail(demoEmails[nextRole])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.")
        }
        await register({ firstName, lastName, email, phone, password, confirmPassword })
        const user = await login(email, password, "customer")
        navigate("/customer")
        return
      }
      const user = await login(email, password, role)
      navigate(user.role === "admin" ? "/admin" : "/customer")
    } catch (err) {
      setError(err.message)
    }
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
            <h2 className="h4 fw-semibold mb-1">{mode === "signup" ? "Customer Signup" : "Login"}</h2>
            <p className="text-muted small mb-4">
              {mode === "signup" ? "Create a customer account." : "Choose a role and sign in."}
            </p>

            {mode === "login" && <div className="row g-3 mb-4">
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
            </div>}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              {error && <div className="alert alert-danger p-2 px-3 small mb-0">{error}</div>}
              {mode === "signup" && (
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-medium">First Name</label>
                    <input className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-medium">Last Name</label>
                    <input className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-medium">Phone</label>
                    <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" required />
                  </div>
                </div>
              )}
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
              {mode === "signup" && <div>
                <label htmlFor="confirmPassword" className="form-label small fw-medium">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>}
              <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                {mode === "signup" ? "Create account" : "Sign in"} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-link text-primary text-decoration-none"
                onClick={() => {
                  const next = mode === "login" ? "signup" : "login"
                  setMode(next)
                  setRole("customer")
                  setEmail(next === "signup" ? "" : demoEmails.customer)
                  setPassword(next === "signup" ? "" : "demo1234")
                  setConfirmPassword("")
                  setError("")
                }}
              >
                {mode === "login" ? "New customer? Create account" : "Already have an account? Login"}
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
