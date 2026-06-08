import { useState } from "react"
import { Plus, FileText, Paperclip } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const filters = ["All", "Pending", "Approved", "Rejected"]

export default function CustomerClaims() {
  const { user } = useAuth()
  const { claims, purchasedPolicies, getPolicy, createClaim } = useData()
  const [filter, setFilter] = useState("All")
  const [open, setOpen] = useState(false)

  const myPolicies = purchasedPolicies.filter((p) => p.customerId === user.id)
  const mine = claims.filter((c) => c.customerId === user.id)
  const visible = [...mine]
    .filter((c) => filter === "All" || c.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  function submit(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createClaim({
      id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: user.id,
      policyId: String(fd.get("policy")),
      amount: Number(fd.get("amount")),
      reason: String(fd.get("reason")),
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
      documents: ["uploaded_document.pdf"],
    })
    setOpen(false)
  }

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

      {open && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <FileText size={18} className="text-primary" /> Create Claim
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setOpen(false)} aria-label="Close" />
                </div>
                <form onSubmit={submit}>
                  <div className="modal-body d-flex flex-column gap-3">
                    {myPolicies.length === 0 ? (
                      <div className="d-flex flex-column align-items-center text-center py-3">
                        <Paperclip size={32} className="text-muted mb-2" />
                        <p className="text-muted small mb-0">
                          You need an active policy before filing a claim.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label htmlFor="policy" className="form-label small fw-medium">Select Policy</label>
                          <select id="policy" name="policy" className="form-select" defaultValue={myPolicies[0]?.policyId}>
                            {myPolicies.map((p) => (
                              <option key={p.id} value={p.policyId}>{getPolicy(p.policyId)?.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="amount" className="form-label small fw-medium">Claim Amount (Rs.)</label>
                          <input id="amount" name="amount" type="number" className="form-control" placeholder="25000" required />
                        </div>
                        <div>
                          <label htmlFor="reason" className="form-label small fw-medium">Reason</label>
                          <textarea id="reason" name="reason" rows={3} className="form-control" placeholder="Describe your claim..." required />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={myPolicies.length === 0}>Submit Claim</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  )
}
