import { IndianRupee, Clock } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatCard } from "../../components/StatCard.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

export default function CustomerPayments() {
  const { user } = useAuth()
  const { payments, getPolicy, payPremium } = useData()

  const mine = payments.filter((p) => p.customerId === user.id)
  const totalPaid = mine.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0)
  const pendingTotal = mine.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount, 0)
  const sorted = [...mine].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <PageHeader title="Payments" description="Track your premium payments and dues." />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard label="Total Paid" value={formatINR(totalPaid)} icon={IndianRupee} accent="green" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Pending Dues" value={formatINR(pendingTotal)} icon={Clock} accent="amber" />
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 table-responsive">
        <h2 className="h6 fw-semibold mb-3">Payment History</h2>
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th className="d-none d-md-table-cell">Policy</th>
              <th className="d-none d-sm-table-cell">Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((pay) => (
              <tr key={pay.id}>
                <td className="fw-medium">{pay.id}</td>
                <td className="d-none d-md-table-cell text-muted">{getPolicy(pay.policyId)?.name ?? "N/A"}</td>
                <td className="d-none d-sm-table-cell text-muted">{pay.date}</td>
                <td>{formatINR(pay.amount)}</td>
                <td><StatusBadge status={pay.status} /></td>
                 <td className="text-end">
                  {pay.status !== "Paid" ? (
                    <button className="btn btn-sm btn-primary" onClick={() => payPremium(pay.id)}>Pay Now</button>
                  ) : (
                    <button className="btn btn-sm btn-outline-secondary" disabled>Done</button>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">No payments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
