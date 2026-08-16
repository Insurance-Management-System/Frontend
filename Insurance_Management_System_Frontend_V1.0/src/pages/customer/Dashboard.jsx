import { Link } from "react-router-dom"
import { FolderOpen, FileText, ShieldCheck, AlertTriangle, CreditCard, Calendar, ArrowRight, ShieldAlert, Clock, XCircle, CheckCircle2 } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatCard } from "../../components/StatCard.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const kycCardMeta = {
  NOT_STARTED: {
    icon: ShieldAlert,
    accent: "warning",
    title: "Complete your KYC",
    message: "You haven't started KYC yet. Complete it now so you can purchase your first policy.",
    action: "Complete KYC",
  },
  PENDING_VERIFICATION: {
    icon: Clock,
    accent: "info",
    title: "KYC under review",
    message: "Your KYC documents have been submitted and are awaiting admin verification.",
    action: "View KYC Status",
  },
  REJECTED: {
    icon: XCircle,
    accent: "danger",
    title: "KYC verification rejected",
    message: "One or more of your KYC documents were rejected. Review the reason and resubmit them.",
    action: "Update KYC",
  },
  VERIFIED: {
    icon: CheckCircle2,
    accent: "success",
    title: "KYC verified",
    message: "Your KYC is verified. You can now purchase insurance policies.",
    action: null,
  },
}

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { purchasedPolicies, claims, payments, getPolicy, getCustomer } = useData()

  const myPolicies = purchasedPolicies.filter((p) => p.customerId === user.id)
  const activeCount = myPolicies.filter((p) => p.status === "Active").length
  const myClaims = claims.filter((c) => c.customerId === user.id)
  const duePayments = payments.filter((p) => p.customerId === user.id && p.status !== "Paid")
  const kycStatus = getCustomer(user.id)?.kycStatus ?? "NOT_STARTED"
  const kyc = kycCardMeta[kycStatus] ?? kycCardMeta.NOT_STARTED
  const KycIcon = kyc.icon

  return (
    <div>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} description="Here's a snapshot of your coverage." />

      <div className={`card border-0 shadow-sm p-3 mb-4 d-flex flex-row gap-3 align-items-center border-start border-4 border-${kyc.accent}`}>
        <div className={`rounded bg-${kyc.accent}-subtle text-${kyc.accent} d-inline-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: 42, height: 42 }}>
          <KycIcon size={20} />
        </div>
        <div className="flex-grow-1">
          <p className="fw-semibold mb-0 small">{kyc.title}</p>
          <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>{kyc.message}</p>
        </div>
        {kyc.action && (
          <Link to="/customer/profile#kyc" className={`btn btn-${kyc.accent} btn-sm text-nowrap`}>{kyc.action}</Link>
        )}
      </div>

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

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h2 className="h6 fw-semibold mb-3">My Coverage Mix</h2>
        <div className="d-flex flex-column gap-3">
          {["Health", "Life", "Vehicle", "Travel"].map((type) => {
            const count = myPolicies.filter((p) => getPolicy(p.policyId)?.type === type).length
            const percent = myPolicies.length ? Math.round((count / myPolicies.length) * 100) : 0
            return (
              <div key={type}>
                <div className="d-flex justify-content-between small mb-1">
                  <span>{type}</span>
                  <span className="fw-semibold">{percent}%</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div className="progress-bar" style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="d-flex align-items-center justify-content-between p-4 pb-3">
              <h2 className="h6 fw-semibold mb-0">My Policies</h2>
              <Link to="/customer/my-policies" className="btn btn-sm btn-link text-primary text-decoration-none">View all</Link>
            </div>
            <div className="p-4 pt-0 d-flex flex-column gap-2">
              {myPolicies.length === 0 && <p className="text-muted small py-3 mb-0">No policies yet.</p>}
              {myPolicies.map((p) => {
                const plan = getPolicy(p.policyId)
                return (
                  <div key={p.id} className="d-flex align-items-center justify-content-between border rounded-3 p-3">
                    <div>
                      <p className="fw-medium mb-0 small">{plan?.name}</p>
                      <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        {plan?.type} - Renews {p.endDate}
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
          <div className="card border-0 shadow-sm h-100">
            <div className="p-4 pb-3 d-flex align-items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              <h2 className="h6 fw-semibold mb-0">Pending Premium Payments</h2>
            </div>
            <div className="p-4 pt-0 d-flex flex-column gap-2">
              {duePayments.length === 0 ? (
                <div className="text-center py-4">
                  <ShieldCheck size={36} className="text-success mb-2" />
                  <p className="text-muted small mb-0">All premiums are up to date!</p>
                </div>
              ) : (
                <>
                  {duePayments.map((payment) => {
                    const plan = getPolicy(payment.policyId)
                    return (
                      <div key={payment.id} className="pending-due-card rounded-3 p-3 d-flex align-items-center justify-content-between gap-2">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 38, height: 38 }}
                          >
                            <AlertTriangle size={16} className="text-primary" />
                          </div>
                          <div>
                            <p className="fw-medium mb-0 small">{plan?.name ?? payment.policyId}</p>
                            <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>
                              <Calendar size={11} className="me-1" />
                              Due: {payment.date}
                            </p>
                            <p className="fw-semibold text-primary mb-0 small">{formatINR(payment.amount)}</p>
                          </div>
                        </div>
                        <Link to="/customer/payments" className="btn btn-sm btn-primary text-nowrap">
                          Pay Now
                        </Link>
                      </div>
                    )
                  })}
                  <Link
                    to="/customer/payments"
                    className="d-flex align-items-center justify-content-between border rounded-3 p-3 text-decoration-none text-muted mt-1"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <span>View all payment history</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
