import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, HeartPulse, Heart, Car, Plane, ShieldCheck, CheckCircle2 } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { DocumentPanel, latestDocumentsByType } from "../../components/DocumentPanel.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const typeIcons = { Health: HeartPulse, Life: Heart, Vehicle: Car, Travel: Plane }
const filters = ["All", "Health", "Life", "Vehicle", "Travel"]
const STEPS = ["Details", "Upload Documents", "Review", "Submit"]

export default function BrowsePolicies() {
  const { policies, purchasedPolicies, getCustomer } = useData()
  const { user } = useAuth()
  const [filter, setFilter] = useState("All")
  const [detail, setDetail] = useState(null)
  const [buying, setBuying] = useState(null)
  const [success, setSuccess] = useState(null)
  const [kycRequired, setKycRequired] = useState(false)
  const navigate = useNavigate()

  const kycVerified = getCustomer(user.id)?.kycStatus === "VERIFIED"

  const ownedActive = new Set(
    purchasedPolicies.filter((p) => p.customerId === user.id && p.status === "Active").map((p) => p.policyId),
  )
  const ownedPending = new Set(
    purchasedPolicies.filter((p) => p.customerId === user.id && p.status === "Pending Payment").map((p) => p.policyId),
  )
  const list = policies.filter((p) => (filter === "All" ? true : p.type === filter))

  function buttonLabel(policyId) {
    if (ownedActive.has(policyId)) return "Owned"
    if (ownedPending.has(policyId)) return "Awaiting Payment"
    return "Buy Policy"
  }

  function isDisabled(policyId) {
    return ownedActive.has(policyId) || ownedPending.has(policyId)
  }

  function startPurchase(policy) {
    if (!kycVerified) {
      setKycRequired(true)
      return
    }
    setBuying(policy)
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
          return (
            <div key={policy.id} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100 p-4 d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="rounded bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center"><Icon size={22} /></div>
                  <span className="badge text-bg-light border text-primary">{policy.type}</span>
                </div>
                <h2 className="h6 fw-semibold mb-1">{policy.name}</h2>
                <p className="text-muted small mb-3" style={{ minHeight: 40 }}>{policy.description}</p>
                <div className="d-flex align-items-baseline gap-1 mb-3">
                  <span className="fs-4 fw-semibold">{formatINR(policy.installmentAmount)}</span>
                  <span className="text-muted small">/ {policy.paymentFrequencyLabel}</span>
                </div>
                <p className="text-muted small mb-3">Coverage up to <span className="fw-medium text-body">{formatINR(policy.coverage)}</span></p>
                <div className="d-flex gap-2 mt-auto">
                  <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => setDetail(policy)}>Details</button>
                  <button
                    className="btn btn-primary btn-sm flex-grow-1"
                    disabled={isDisabled(policy.id)}
                    onClick={() => startPurchase(policy)}
                  >
                    {buttonLabel(policy.id)}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <span className="badge text-bg-light border text-primary mb-3 d-inline-block">{detail.type}</span>
          <p className="text-muted small">{detail.description}</p>
          <div className="row g-3 my-2">
            <div className="col-6 border rounded-3 p-3">
              <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>Coverage</p>
              <p className="fw-semibold mb-0">{formatINR(detail.coverage)}</p>
            </div>
            <div className="col-6 border rounded-3 p-3">
              <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>Premium</p>
              <p className="fw-semibold mb-0">{formatINR(detail.installmentAmount)} / {detail.paymentFrequencyLabel}</p>
            </div>
          </div>
          <p className="text-muted small mb-2">
            Total premium: <span className="fw-medium text-body">{formatINR(detail.premium)}</span> over the {detail.duration} policy term.
          </p>
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
              disabled={isDisabled(detail.id)}
              onClick={() => { startPurchase(detail); setDetail(null) }}
            >
              {isDisabled(detail.id) ? buttonLabel(detail.id) : `Buy for ${formatINR(detail.installmentAmount)}/${detail.paymentFrequencyLabel}`}
            </button>
          </div>
        </Modal>
      )}

      {kycRequired && (
        <Modal title="KYC Required" onClose={() => setKycRequired(false)}>
          <p className="text-muted small mb-4">
            You must complete and get your KYC approved before purchasing an insurance policy.
          </p>
          <div className="d-flex gap-2">
            <button className="btn btn-light flex-grow-1" onClick={() => setKycRequired(false)}>Cancel</button>
            <button className="btn btn-primary flex-grow-1" onClick={() => navigate("/customer/profile#kyc")}>
              Complete KYC
            </button>
          </div>
        </Modal>
      )}

      {buying && (
        <PurchaseWizard
          policy={buying}
          onClose={() => setBuying(null)}
          onPurchased={() => { setSuccess(buying); setBuying(null) }}
        />
      )}

      {success && (
        <Modal title="" onClose={() => setSuccess(null)}>
          <div className="text-center py-3">
            <CheckCircle2 size={56} className="text-success mb-3" />
            <h4 className="fw-semibold">Documents Approved — Payment Ready</h4>
            <p className="text-muted small mb-4">
              Your documents for {success.name} were approved. Please complete the payment of {formatINR(success.premium)} from My Payments.
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

function PurchaseWizard({ policy, onClose, onPurchased }) {
  const { user } = useAuth()
  const { buyPolicy, listDocuments } = useData()
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const required = policy.requiredPurchaseDocuments ?? []

  async function allDocumentsVerified() {
    if (required.length === 0) return true
    const docs = await listDocuments("POLICY_PURCHASE", policy.purchaseDocumentReferenceId)
    const latest = latestDocumentsByType(docs)
    return required.every((doc) => latest.get(doc.name.toLowerCase())?.verificationStatus === "VERIFIED")
  }

  async function goNext() {
    setError("")
    if (step === 1) {
      setBusy(true)
      const verified = await allDocumentsVerified().finally(() => setBusy(false))
      if (!verified) {
        setError("Every required document must be uploaded and verified by an admin before you continue.")
        return
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  async function submit() {
    setBusy(true)
    setError("")
    try {
      const verified = await allDocumentsVerified()
      if (!verified) {
        setError("Documents are not fully verified yet. Go back and check their status.")
        setStep(1)
        return
      }
      await buyPolicy(policy, user.id)
      onPurchased()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={`Buy ${policy.name}`} onClose={onClose}>
      <div className="d-flex align-items-center gap-2 mb-3">
        {STEPS.map((label, i) => (
          <div key={label} className="d-flex align-items-center gap-2 flex-grow-1">
            <span
              className={`rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0 ${i <= step ? "bg-primary text-white" : "bg-light text-muted border"}`}
              style={{ width: 24, height: 24, fontSize: "0.75rem" }}
            >
              {i + 1}
            </span>
            <span className={`small text-nowrap d-none d-sm-inline ${i === step ? "fw-semibold" : "text-muted"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-grow-1 ${i < step ? "bg-primary" : "bg-light"}`} style={{ height: 2 }} />}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger small py-2">{error}</div>}

      {step === 0 && (
        <div>
          <div className="border rounded-3 p-3 mb-3">
            <p className="fw-medium mb-1">{policy.name}</p>
            <div className="d-flex justify-content-between small text-muted">
              <span>Premium ({policy.paymentFrequencyLabel})</span>
              <span className="fw-semibold text-body">{formatINR(policy.installmentAmount)}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted">
              <span>Total Premium ({policy.duration} term)</span>
              <span className="fw-semibold text-body">{formatINR(policy.premium)}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted">
              <span>Coverage</span>
              <span className="fw-semibold text-body">{formatINR(policy.coverage)}</span>
            </div>
          </div>
          <p className="text-muted small mb-0">
            {required.length > 0
              ? `This plan requires ${required.length} document${required.length > 1 ? "s" : ""} before purchase. Upload them in the next step.`
              : "No documents are required to purchase this plan."}
          </p>
        </div>
      )}

      {step === 1 && (
        <DocumentPanel
          title="Required Policy Documents"
          referenceType="POLICY_PURCHASE"
          referenceId={policy.purchaseDocumentReferenceId}
          requiredDocuments={required}
          compact
        />
      )}

      {step === 2 && (
        <div>
          <p className="text-muted small">Review your purchase before submitting.</p>
          <div className="border rounded-3 p-3 mb-3">
            <p className="fw-medium mb-1">{policy.name}</p>
            <div className="d-flex justify-content-between small text-muted">
              <span>Premium ({policy.paymentFrequencyLabel})</span>
              <span className="fw-semibold text-body">{formatINR(policy.installmentAmount)}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted">
              <span>Coverage</span>
              <span className="fw-semibold text-body">{formatINR(policy.coverage)}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted">
              <span>Documents</span>
              <span className="fw-semibold text-success">{required.length > 0 ? "All verified" : "None required"}</span>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <p className="text-muted small">
          Submitting will create your policy purchase in "Awaiting Payment" status. Complete the payment from My Payments to activate it.
        </p>
      )}

      <div className="d-flex gap-2 mt-3">
        {step > 0 && (
          <button className="btn btn-light flex-grow-1" disabled={busy} onClick={() => setStep((s) => s - 1)}>Back</button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary flex-grow-1" disabled={busy} onClick={goNext}>
            {busy ? "Checking..." : "Continue"}
          </button>
        ) : (
          <button className="btn btn-primary flex-grow-1" disabled={busy} onClick={submit}>
            {busy ? "Submitting..." : "Submit Purchase"}
          </button>
        )}
      </div>
    </Modal>
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
