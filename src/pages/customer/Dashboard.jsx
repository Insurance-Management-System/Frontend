import { Link } from "react-router-dom"
import { FolderOpen, FileText, ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatCard } from "../../components/StatCard.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { purchasedPolicies, claims, payments, getPolicy } = useData()

  const myPolicies = purchasedPolicies.filter((p) => p.customerId === user.id)
  const activeCount = myPolicies.filter((p) => p.status === "Active").length
  const myClaims = claims.filter((c) => c.customerId === user.id)
  const duePayments = payments.filter((p) => p.customerId === user.id && p.status !== "Paid")

  return (
    <div>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} description="Here's a snapshot of your coverage." />

      {duePayments.length > 0 && (
        <div className="ag-due-card p-3 d-flex align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <AlertTriangle size={20} className="text-warning flex-shrink-0" />
            <div>
              <p className="fw-medium mb-0 small">You have {duePayments.length} pending premium payment(s)</p>
              <p className="text-muted-2 mb-0" style={{ fontSize: "0.8rem" }}>Pay now to keep your policies active.</p>
            </div>
          </div>
          <Link to="/customer/payments" className="btn btn-sm btn-primary text-nowrap">Pay Now</Link>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard label="Active Policies" value={activeCount} icon={ShieldCheck} accent="primary" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Total Policies" value={myPolicies.length} icon={FolderOpen} accent="blue" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Claims Filed" value={myClaims.length} icon={FileText} accent="teal" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Pending Dues" value={duePayments.length} icon={AlertTriangle} accent="amber" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="ag-card">
            <div className="ag-card-header d-flex align-items-center justify-content-between p-4 pb-3">
              <h2 className="h6 fw-semibold mb-0">My Policies</h2>
              <Link to="/customer/my-policies" className="btn btn-sm btn-link text-primary text-decoration-none">View all</Link>
            </div>
            <div className="p-4 pt-0 d-flex flex-column gap-2">
              {myPolicies.length === 0 && <p className="text-muted-2 small py-3 mb-0">No policies yet.</p>}
              {myPolicies.map((p) => {
                const plan = getPolicy(p.policyId)
                return (
                  <div key={p.id} className="d-flex align-items-center justify-content-between border rounded-3 p-3">
                    <div>
                      <p className="fw-medium mb-0 small">{plan?.name}</p>
                      <p className="text-muted-2 mb-0" style={{ fontSize: "0.75rem" }}>
                        {plan?.type} · Renews {p.endDate}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="ag-card h-100">
            <div className="ag-card-header p-4 pb-3">
              <h2 className="h6 fw-semibold mb-0">Quick Actions</h2>
            </div>
            <div className="p-4 pt-0 d-flex flex-column gap-2">
              <QuickAction to="/customer/policies" label="Browse new policies" />
              <QuickAction to="/customer/claims" label="File a new claim" />
              <QuickAction to="/customer/payments" label="View payment history" />
              <QuickAction to="/customer/profile" label="Update profile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ to, label }) {
  return (
    <Link to={to} className="d-flex align-items-center justify-content-between border rounded-3 p-3 text-decoration-none text-body ag-nav-link" style={{ borderRadius: "0.75rem" }}>
      <span className="small fw-medium">{label}</span>
      <ArrowRight size={16} />
    </Link>
  )
}
