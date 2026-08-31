import { useEffect, useState } from "react"
import { Check, X, FileText, Paperclip } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const filters = ["All", "Submitted", "Approved", "Rejected"]

export default function AdminClaims() {
  const { claims, getCustomer, getPolicy, setClaimStatus, listDocuments } = useData()
  const [filter, setFilter] = useState("All")
  const [active, setActive] = useState(null)

  const list = [...claims]
    .filter((c) => filter === "All" || c.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  function decide(id, status) {
    setClaimStatus(id, status)
    setActive(null)
  }

  return (
    <div>
      <PageHeader title="Claims Processing" description="Review, approve or reject customer claims." />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        {filters.map((f) => {
          const count = f === "All" ? claims.length : claims.filter((c) => c.status === f).length
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
              <th>Customer</th>
              <th className="d-none d-md-table-cell">Policy</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td className="fw-medium">{c.id}</td>
                <td>{getCustomer(c.customerId)?.name}</td>
                <td className="d-none d-md-table-cell text-muted">{getPolicy(c.policyId)?.name}</td>
                <td>{formatINR(c.amount)}</td>
                <td><StatusBadge status={c.status} /></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-link text-primary text-decoration-none" onClick={() => setActive(c)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">No claims in this category.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <ClaimReview claim={active} onClose={() => setActive(null)} onDecide={decide} getCustomer={getCustomer} getPolicy={getPolicy} listDocuments={listDocuments} />
      )}
    </div>
  )
}

function ClaimReview({ claim, onClose, onDecide, getCustomer, getPolicy, listDocuments }) {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    listDocuments("CLAIM", claim.referenceId).then(setDocuments).catch(() => setDocuments([]))
  }, [claim.referenceId, listDocuments])

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <FileText size={18} className="text-primary" /> {claim.id}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body d-flex flex-column gap-3">
              <div className="row g-3 small">
                <Field label="Customer" value={getCustomer(claim.customerId)?.name} />
                <Field label="Policy" value={getPolicy(claim.policyId)?.name} />
                <Field label="Amount" value={formatINR(claim.amount)} />
                <Field label="Filed on" value={claim.date} />
              </div>
              <div>
                <p className="text-muted small mb-1">Reason</p>
                <p className="mb-0">{claim.reason}</p>
              </div>
              <div>
                <p className="text-muted small mb-2">Documents</p>
                <div className="d-flex flex-wrap gap-2">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 fw-normal text-decoration-none"
                      href={`${import.meta.env.VITE_DOCUMENT_API_URL ?? "http://localhost:8084/api/documents"}/${doc.id}/file`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Paperclip size={12} /> {doc.documentType} ({doc.verificationStatus})
                    </a>
                  ))}
                  {documents.length === 0 && <p className="text-muted small mb-0">No documents uploaded.</p>}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Current status:</span>
                <StatusBadge status={claim.status} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={() => onDecide(claim.id, "Rejected")}>
                <X size={16} /> Reject
              </button>
              <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => onDecide(claim.id, "Approved")}>
                <Check size={16} /> Approve
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}

function Field({ label, value }) {
  return (
    <div className="col-6">
      <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>{label}</p>
      <p className="fw-medium mb-0">{value}</p>
    </div>
  )
}
