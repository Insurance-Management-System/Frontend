import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, HeartPulse, Heart, Car, Plane, ShieldCheck, CheckCircle2 } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const typeIcons = { Health: HeartPulse, Life: Heart, Vehicle: Car, Travel: Plane }
const filters = ["All", "Health", "Life", "Vehicle", "Travel"]

export default function BrowsePolicies() {
  const { policies, purchasedPolicies, buyPolicy } = useData()
  const { user } = useAuth()
  const [filter, setFilter] = useState("All")
  const [detail, setDetail] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const owned = new Set(
    purchasedPolicies.filter((p) => p.customerId === user.id && p.status === "Active").map((p) => p.policyId),
  )
  const list = policies.filter((p) => (filter === "All" ? true : p.type === filter))

  function confirmPurchase() {
    buyPolicy(confirming, user.id)
    setSuccess(confirming)
    setConfirming(null)
    setDetail(null)
  }

  return (
    <div>
      <PageHeader title="Browse Policies" description="Explore and purchase insurance plans tailored for you." />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        {filters.map((f) => (
          <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="row g-3">
        {list.map((policy) => {
          const Icon = typeIcons[policy.type] || ShieldCheck
          const isOwned = owned.has(policy.id)
          return (
            <div key={policy.id} className="col-12 col-md-6 col-xl-4">
              <div className="ag-card h-100 p-4 d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="ag-stat-icon ag-soft-icon"><Icon size={22} /></div>
                  <span className="ag-badge ag-badge-type">{policy.type}</span>
                </div>
                <h2 className="h6 fw-semibold mb-1">{policy.name}</h2>
                <p className="text-muted-2 small mb-3" style={{ minHeight: 40 }}>{policy.description}</p>
                <div className="d-flex align-items-baseline gap-1 mb-3">
                  <span className="fs-4 fw-semibold">{formatINR(policy.premium)}</span>
                  <span className="text-muted-2 small">/ {policy.duration}</span>
                </div>
                <p className="text-muted-2 small mb-3">Coverage up to <span className="fw-medium text-body">{formatINR(policy.coverage)}</span></p>
                <div className="d-flex gap-2 mt-auto">
                  <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => setDetail(policy)}>Details</button>
                  <button
                    className="btn btn-primary btn-sm flex-grow-1"
                    disabled={isOwned}
                    onClick={() => setConfirming(policy)}
                  >
                    {isOwned ? "Owned" : "Buy Now"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Details modal */}
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <span className="ag-badge ag-badge-type mb-3 d-inline-block">{detail.type}</span>
          <p className="text-muted-2 small">{detail.description}</p>
          <div className="row g-3 my-2">
            <div className="col-6 border rounded-3 p-3">
              <p className="text-muted-2 mb-0" style={{ fontSize: "0.72rem" }}>Coverage</p>
              <p className="fw-semibold mb-0">{formatINR(detail.coverage)}</p>
            </div>
            <div className="col-6 border rounded-3 p-3">
              <p className="text-muted-2 mb-0" style={{ fontSize: "0.72rem" }}>Premium</p>
              <p className="fw-semibold mb-0">{formatINR(detail.premium)} / {detail.duration}</p>
            </div>
          </div>
          <p className="fw-medium small mt-3 mb-2">Key Benefits</p>
          <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
            {detail.benefits.map((b) => (
              <li key={b} className="d-flex align-items-start gap-2 small">
                <Check size={16} className="text-primary flex-shrink-0 mt-1" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="d-grid mt-4">
            <button
              className="btn btn-primary"
              disabled={owned.has(detail.id)}
              onClick={() => setConfirming(detail)}
            >
              {owned.has(detail.id) ? "Already Owned" : `Buy for ${formatINR(detail.premium)}`}
            </button>
          </div>
        </Modal>
      )}

      {/* Purchase confirmation */}
      {confirming && (
        <Modal title="Confirm Purchase" onClose={() => setConfirming(null)}>
          <p className="small text-muted-2">You are about to purchase the following plan:</p>
          <div className="border rounded-3 p-3 mb-3">
            <p className="fw-medium mb-1">{confirming.name}</p>
            <div className="d-flex justify-content-between small text-muted-2">
              <span>Premium ({confirming.duration})</span>
              <span className="fw-semibold text-body">{formatINR(confirming.premium)}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted-2">
              <span>Coverage</span>
              <span className="fw-semibold text-body">{formatINR(confirming.coverage)}</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light flex-grow-1" onClick={() => setConfirming(null)}>Cancel</button>
            <button className="btn btn-primary flex-grow-1" onClick={confirmPurchase}>Confirm & Pay</button>
          </div>
        </Modal>
      )}

      {/* Success */}
      {success && (
        <Modal title="" onClose={() => setSuccess(null)}>
          <div className="text-center py-3">
            <CheckCircle2 size={56} className="text-success mb-3" />
            <h4 className="fw-semibold">Policy Purchased!</h4>
            <p className="text-muted-2 small mb-4">
              {success.name} is now active. A payment of {formatINR(success.premium)} was recorded.
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-light flex-grow-1" onClick={() => setSuccess(null)}>Keep Browsing</button>
              <button className="btn btn-primary flex-grow-1" onClick={() => navigate("/customer/my-policies")}>
                View My Policies
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}
