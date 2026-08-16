import { useState } from "react"
import { Plus, FileText, Paperclip } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { DocumentPanel, latestDocumentsByType } from "../../components/DocumentPanel.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const filters = ["All", "Submitted", "Approved", "Rejected"]
const STEPS = ["Policy & Details", "Upload Documents", "Review", "Submit"]

export default function CustomerClaims() {
  const { user } = useAuth()
  const { claims, purchasedPolicies, getPolicy } = useData()
  const [filter, setFilter] = useState("All")
  const [open, setOpen] = useState(false)

  const claimableStatuses = ["Active", "Payment Due", "Grace Period", "Cancellation Requested"]
  const myPolicies = purchasedPolicies.filter((p) => p.customerId === user.id && claimableStatuses.includes(p.status))
  const mine = claims.filter((c) => c.customerId === user.id && c.status !== "Draft")
  const visible = [...mine]
    .filter((c) => filter === "All" || c.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <PageHeader
        title="My Claims"
        description="Track and file claims against your policies."
        action={
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setOpen(true)}>
            <Plus size={16} /> Create Claim
          </button>
        }
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        {filters.map((f) => {
          const count = f === "All" ? mine.length : mine.filter((c) => c.status === f).length
          return (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter(f)}
            >
              {f} <span className="opacity-75">({count})</span>
            </button>
          )
        })}
      </div>

      <div className="card border-0 shadow-sm p-4 table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th className="d-none d-md-table-cell">Policy</th>
              <th>Amount</th>
              <th className="d-none d-sm-table-cell">Reason</th>
              <th className="d-none d-lg-table-cell">Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c.id}>
                <td className="fw-medium">{c.id}</td>
                <td className="d-none d-md-table-cell text-muted">{getPolicy(c.policyId)?.name}</td>
                <td>{formatINR(c.amount)}</td>
                <td className="d-none d-sm-table-cell text-muted text-truncate" style={{ maxWidth: "16rem" }}>
                  {c.reason}
                </td>
                <td className="d-none d-lg-table-cell text-muted">{c.date}</td>
                <td><StatusBadge status={c.status} /></td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">No claims here yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && <ClaimWizard myPolicies={myPolicies} onClose={() => setOpen(false)} />}
    </div>
  )
}

function ClaimWizard({ myPolicies, onClose }) {
  const { user } = useAuth()
  const { getPolicy, createClaimDraft, submitClaim, listDocuments } = useData()
  const [step, setStep] = useState(0)
  const [policyId, setPolicyId] = useState(myPolicies[0]?.policyId ?? "")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const policy = getPolicy(policyId)
  const required = policy?.requiredClaimDocuments ?? []
  const selectedPurchase = myPolicies.find((p) => p.policyId === policyId)
  const hasPendingPremium = selectedPurchase && ["Payment Due", "Grace Period"].includes(selectedPurchase.status)

  async function allDocumentsUploaded() {
    if (!draft || required.length === 0) return true
    const docs = await listDocuments("CLAIM", draft.referenceId)
    const latest = latestDocumentsByType(docs)
    return required.every((doc) => latest.has(doc.name.toLowerCase()))
  }

  async function goNext() {
    setError("")
    setBusy(true)
    try {
      if (step === 0) {
        if (!amount || Number(amount) <= 0) {
          setError("Enter a claim amount.")
          return
        }
        const created = await createClaimDraft({ customerId: String(user.id), policyId })
        setDraft(created)
      } else if (step === 1) {
        const uploaded = await allDocumentsUploaded()
        if (!uploaded) {
          setError("Upload every required proof document before continuing.")
          return
        }
      }
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function submit() {
    setBusy(true)
    setError("")
    try {
      const uploaded = await allDocumentsUploaded()
      if (!uploaded) {
        setError("Upload every required proof document before submitting.")
        setStep(1)
        return
      }
      await submitClaim(draft.id, { amount: Number(amount), reason })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <FileText size={18} className="text-primary" /> File a Claim
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-2 mb-1">
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

              {error && <div className="alert alert-danger small py-2 mb-0">{error}</div>}

              {myPolicies.length === 0 ? (
                <div className="d-flex flex-column align-items-center text-center py-3">
                  <Paperclip size={32} className="text-muted mb-2" />
                  <p className="text-muted small mb-0">You need an active policy before filing a claim.</p>
                </div>
              ) : (
                <>
                  {step === 0 && (
                    <>
                      <div>
                        <label className="form-label small fw-medium">Select Policy</label>
                        <select className="form-select" value={policyId} onChange={(e) => setPolicyId(e.target.value)}>
                          {myPolicies.map((p) => (
                            <option key={p.id} value={p.policyId}>{getPolicy(p.policyId)?.name}</option>
                          ))}
                        </select>
                      </div>
                      {hasPendingPremium && (
                        <div className="alert alert-warning small py-2 mb-0">
                          This policy has pending premium payments. You must clear them before you can submit a claim.
                        </div>
                      )}
                      <div>
                        <label className="form-label small fw-medium">Claim Amount (Rs.)</label>
                        <input type="number" className="form-control" placeholder="25000" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label small fw-medium">Reason</label>
                        <textarea rows={3} className="form-control" placeholder="Describe your claim..." value={reason} onChange={(e) => setReason(e.target.value)} />
                      </div>
                    </>
                  )}

                  {step === 1 && draft && (
                    <DocumentPanel
                      title="Required Claim Documents"
                      referenceType="CLAIM"
                      referenceId={draft.referenceId}
                      requiredDocuments={required}
                      compact
                    />
                  )}

                  {step === 2 && (
                    <div className="border rounded-3 p-3">
                      <p className="fw-medium mb-1">{policy?.name}</p>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Amount</span>
                        <span className="fw-semibold text-body">{formatINR(Number(amount))}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Reason</span>
                        <span className="fw-semibold text-body text-truncate" style={{ maxWidth: "60%" }}>{reason || "—"}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Documents</span>
                        <span className="fw-semibold text-success">{required.length > 0 ? "All uploaded" : "None required"}</span>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <p className="text-muted small mb-0">Submitting sends your claim for admin review. You'll see status updates here.</p>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={onClose}>Cancel</button>
              {myPolicies.length > 0 && (
                <>
                  {step > 0 && (
                    <button className="btn btn-outline-primary" disabled={busy} onClick={() => setStep((s) => s - 1)}>Back</button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button className="btn btn-primary" disabled={busy} onClick={goNext}>{busy ? "Please wait..." : "Continue"}</button>
                  ) : (
                    <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? "Submitting..." : "Submit Claim"}</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}
