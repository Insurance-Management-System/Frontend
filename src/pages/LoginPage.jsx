import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, Users, ArrowRight } from "lucide-react"
import { Logo } from "../components/Logo.jsx"
import { useAuth } from "../lib/auth-context.jsx"


export default function LoginPage(){
    const {login} = useAuth()
    const navigate = useNavigate()
    const [role, setRole] = useState("admin")
    const [email, setEmail] = useState("admin@gmail.com")
    const [password, setPassword] = useState("admin")

    function handleSubmit(e){
        e.preventDefault()
        const user = login(email,role)
        navigate(user.role === "admin" ? "/admin" : "/customer")
    }


    function selectRole(next){
        setRole(next)
        setEmail (next==="admin" ? "admin@gmail.com" : "vrushabh@gmail.com")
    }

    return(
        <main className="ag-login">
            <section className="ag-login-brand">
                <Logo light />
                <div className="d-none d-lg-flex flex-column gap-4">
                    <h1 className="fw-semibold lh-sm" style={{ fontSize: "2.2rem" }}>Protecting what matters, all in one place.</h1>
                    <p style={{ maxWidth: 420, color: "rgba(255,255,255,0.82)" }}> Manage policies, claims, payments and customers from a single, secure platform built for insurers and policyholders alike.</p>    
                </div>
                <p className="small mb-0" style={{ color: "rgba(255,255,255,0.6)" }}>© 2026 AegisInsure. All rights reserved.</p>
            </section>

             <section className="ag-login-form">
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <div className="mb-4">
                        <h2 className="fw-semibold mb-1">Welcome back</h2>
                        <p className="text-muted-2 small mb-0">Sign in to continue to your dashboard.</p>
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-6">
                        <RoleOption
                        active={role === "admin"}
                        onClick={() => selectRole("admin")}
                        icon={<ShieldCheck size={20} />}
                        label="Admin"
                        hint="Manage everything"/>
                    </div>

                    <div className="col-6">
                        <RoleOption active={role === "customer"}
                        onClick={() => selectRole("customer")}
                        icon={<Users size={20} />}
                        label="Customer"
                        hint="View my policies"/>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div>
                        <label htmlFor="email" className="form-label small fw-medium">Email</label>
                        <input id="email" type="email" className="form-control" value={email}  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required/>

                    </div>
                    <div>
                         <label htmlFor="password" className="form-label small fw-medium">Password</label>
                         <input
                            id="password" type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required/>

                    </div>
                    <button type="submit" className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2">
                         Sign in as {role === "admin" ? "Admin" : "Customer"}
                         <ArrowRight size={16} />
                    </button>
                </form>

             </section>
        </main>
    )
}

function RoleOption({ active, onClick, icon, label, hint }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`ag-role-option ${active ? "active" : ""}`}>
      <span className={active ? "text-primary" : "text-muted-2"}>{icon}</span>
      <div className="fw-semibold small mt-2">{label}</div>
      <div className="text-muted-2" style={{ fontSize: "0.75rem" }}>{hint}</div>
    </button>
  )
}