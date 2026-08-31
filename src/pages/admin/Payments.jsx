import { IndianRupee, TrendingUp, Clock, XCircle } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatCard } from "../../components/StatCard.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

export default function AdminPayments() {
  const { payments, getCustomer, getPolicy } = useData()

  const paid = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0)
  const failed = payments.filter((p) => p.status === "Failed").length

  const sorted = [...payments].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <PageHeader title="Payments" description="Track premium collections and payment status." />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard label="Collected" value={formatINR(paid)} icon={IndianRupee} accent="green" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Pending" value={formatINR(pending)} icon={Clock} accent="amber" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Failed" value={failed} icon={XCircle} accent="primary" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Transactions" value={payments.length} icon={TrendingUp} accent="blue" />
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Customer</th>
              <th className="d-none d-md-table-cell">Policy</th>
              <th>Amount</th>
              <th className="d-none d-sm-table-cell">Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id}>
                <td className="fw-medium">{p.id}</td>
                <td>{getCustomer(p.customerId)?.name}</td>
                <td className="d-none d-md-table-cell text-muted">{getPolicy(p.policyId)?.name}</td>
                <td>{formatINR(p.amount)}</td>
                <td className="d-none d-sm-table-cell text-muted">{p.date}</td>
                <td><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
