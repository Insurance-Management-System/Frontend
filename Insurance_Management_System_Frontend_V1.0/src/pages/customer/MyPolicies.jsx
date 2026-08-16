import { useState } from "react"
import { Link } from "react-router-dom"
import { HeartPulse, Heart, Car, Plane, ShieldCheck, CalendarRange } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const typeIcons = { Health: HeartPulse, Life: Heart, Vehicle: Car, Travel: Plane }

export default function MyPolicies() {
  const { user } = useAuth()
  const { purchasedPolicies, getPolicy, requestPolicyCancellation } = useData()
  const [processingId, setProcessingId] = useState("")
  const mine = purchasedPolicies.filter((p) => p.customerId === user.id)

  async function handleRequestCancellation(id) {
    setProcessingId(id)
    try {
      await requestPolicyCancellation(id)
    } catch (err) {
      alert(err.message)
    } finally {
      setProcessingId("")
    }
  }

  return (
    <div>
      <PageHeader
        title="My Policies"
        description="All your active and past insurance plans."
        action={
          <Link to="/customer/policies" className="btn btn-primary">Browse More</Link>
        }
      />

      {mine.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <ShieldCheck size={40} className="text-muted mb-3" />
          <p className="fw-medium mb-1">No policies yet</p>
          <p className="text-muted small mb-3">Browse our plans to get protected today.</p>
          <Link to="/customer/policies" className="btn btn-primary">Browse Policies</Link>
        </div>
      ) : (
        <div className="row g-3">
          {mine.map((p) => {
            const plan = getPolicy(p.policyId)
            const Icon = typeIcons[plan?.type] || ShieldCheck
            return (
              <div key={p.id} className="col-12 col-md-6">
                <div className="card border-0 shadow-sm h-100 p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center"><Icon size={22} /></div>
                      <div>
                        <p className="fw-semibold mb-0">{plan?.name}</p>
                        <p className="text-muted small mb-0">{plan?.type} Insurance</p>
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="row g-3 small">
                    <div className="col-6">
                      <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>Coverage</p>
                      <p className="fw-medium mb-0">{formatINR(plan?.coverage)}</p>
                    </div>
                    <div className="col-6">
                      <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>Premium</p>
                      <p className="fw-medium mb-0">
                        {formatINR(plan?.installmentAmount)}
                        <span className="text-muted fw-normal" style={{ fontSize: "0.72rem" }}>/{plan?.paymentFrequencyLabel}</span>
                      </p>
                    </div>
                  </div>
                  {(p.status === "Payment Due" || p.status === "Pending Payment" || p.status === "Grace Period") && p.nextDueDate && (
                    <p className="text-muted small mt-2 mb-0">Next due date: <span className="fw-medium text-body">{p.nextDueDate}</span></p>
                  )}
                  <div className="d-flex align-items-center gap-2 text-muted small mt-3 pt-3 border-top">
                    <CalendarRange size={16} />
                    <span>{p.startDate} to {p.endDate}</span>
                  </div>
                  {p.status === "Grace Period" && (
                    <p className="text-danger small mt-3 mb-0">
                      Your policy is in its grace period - pay all pending installments now to avoid it lapsing.
                    </p>
                  )}
                  {p.status === "Lapsed" && (
                    <p className="text-danger small mt-3 mb-0">
                      This policy has lapsed due to missed payments. Pay all pending installments to reinstate it.
                    </p>
                  )}
                  {["Payment Due", "Pending Payment", "Grace Period", "Lapsed"].includes(p.status) && (
                    <Link to="/customer/payments" className="btn btn-sm btn-primary mt-3 d-block">
                      {p.paidInstallments === 0 ? "Complete Payment to Activate" : "Pay Now"}
                    </Link>
                  )}
                  {p.status === "Active" && (
                    <button
                      className="btn btn-sm btn-outline-danger mt-3 d-block"
                      disabled={processingId === p.id}
                      onClick={() => handleRequestCancellation(p.id)}
                    >
                      {processingId === p.id ? "Requesting..." : "Request Cancellation"}
                    </button>
                  )}
                  {p.status === "Cancellation Requested" && (
                    <p className="text-muted small mt-3 mb-0 text-center">
                      Cancellation requested. Please visit your nearest branch office to complete the closure.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
