import { AlertTriangle, IndianRupee, Clock } from "lucide-react"
import { useState } from "react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatCard } from "../../components/StatCard.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

export default function CustomerPayments() {
  const { user } = useAuth()
  const { payments, purchasedPolicies, getPolicy, payPremium } = useData()
  const [processingId, setProcessingId] = useState("")
  const [paymentError, setPaymentError] = useState("")

  const mine = payments.filter((p) => p.customerId === user.id)
  const totalPaid = mine.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0)
  const pendingTotal = mine.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount, 0)
  const sorted = [...mine].sort((a, b) => b.date.localeCompare(a.date))

  const arrearsByPolicy = new Map()
  for (const p of mine) {
    if (p.status === "Paid") continue
    const group = arrearsByPolicy.get(p.customerPolicyId) ?? { count: 0, total: 0, payment: p }
    group.count += 1
    group.total += p.amount
    arrearsByPolicy.set(p.customerPolicyId, group)
  }
  const arrearsGroups = [...arrearsByPolicy.entries()].filter(([, g]) => g.count > 1)

  async function handlePay(payment) {
    setPaymentError("")
    setProcessingId(payment.id)
    try {
      await payPremium(payment)
    } catch (err) {
      setPaymentError(err.message)
    } finally {
      setProcessingId("")
    }
  }

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

      {arrearsGroups.map(([customerPolicyId, group]) => (
        <div key={customerPolicyId} className="alert alert-danger d-flex align-items-center gap-3 mb-4">
          <AlertTriangle size={20} className="flex-shrink-0" />
          <div className="flex-grow-1 small">
            You have <strong>{group.count} pending installments</strong> totaling{" "}
            <strong>{formatINR(group.total)}</strong> for {getPolicy(group.payment.policyId)?.name ?? "this policy"}.
            All pending installments must be paid together to reactivate this policy.
          </div>
          <button
            className="btn btn-sm btn-danger text-nowrap"
            disabled={processingId === group.payment.id}
            onClick={() => handlePay(group.payment)}
          >
            {processingId === group.payment.id ? "Opening..." : `Pay All (${formatINR(group.total)})`}
          </button>
        </div>
      ))}

      <div className="card border-0 shadow-sm p-4 table-responsive">
        <h2 className="h6 fw-semibold mb-3">Payment History</h2>
        {paymentError && <div className="alert alert-danger small py-2">{paymentError}</div>}
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th className="d-none d-md-table-cell">Policy</th>
              <th className="d-none d-lg-table-cell">Installment</th>
              <th className="d-none d-sm-table-cell">Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((pay) => {
              const purchase = purchasedPolicies.find((pp) => pp.id === `pp${pay.customerPolicyId}`)
              return (
              <tr key={pay.id}>
                <td className="fw-medium">{pay.id}</td>
                <td className="d-none d-md-table-cell text-muted">{getPolicy(pay.policyId)?.name ?? "N/A"}</td>
                <td className="d-none d-lg-table-cell text-muted">
                  {purchase?.totalInstallments ? `${purchase.paidInstallments}/${purchase.totalInstallments}` : "—"}
                </td>
                <td className="d-none d-sm-table-cell text-muted">{pay.dueDate ?? pay.date}</td>
                <td>{formatINR(pay.amount)}</td>
                <td><StatusBadge status={pay.status} /></td>
                 <td className="text-end">
                  {pay.status !== "Paid" ? (
                    <button className="btn btn-sm btn-primary" disabled={processingId === pay.id} onClick={() => handlePay(pay)}>
                      {processingId === pay.id ? "Opening..." : "Pay Now"}
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-outline-secondary" disabled>Done</button>
                  )}
                </td>
              </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">No payments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
