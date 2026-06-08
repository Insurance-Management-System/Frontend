import { useMemo, useState } from "react"
import { Check, X, FileText, Paperclip } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const filters = ["All", "Pending", "Approved", "Rejected"]

export default function AdminClaims(){
    const { claims, getCustomer, getPolicy, setClaimStatus } = useData()
    const [filter, setFilter] = useState("All")
    const [active, setActive] = useState(null)

    const list = useMemo(
        () =>
            [...claims]
            .filter((c) => (filter === "All" ? true : c.status === filter))
            .sort((a, b) => b.date.localeCompare(a.date)),
        [claims, filter],
    )


    function decide(id, status){
        setClaimStatus(id, status)
        setActive(null)
    }

    return(
        <div>
            <PageHeader title="Claims Processing" description="Review, approve or reject customer claims." />
            <div className="d-flex gap-2 mb-3 flex-wrap">
                {filters.map((f) => {
                    const count = f === "All" ? claims.length : claims.filter((c) => c.status === f).length
                    return (
                        <button
                        key={f}
                        className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setFilter(f)}>
                        {f} <span className="opacity-75">({count})</span>
                        </button>
                    )
                })}
            </div>


            <div className="ag-card p-4 table-responsive">
                <table className="table ag-table align-middle">
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
                                <td className="d-none d-md-table-cell text-muted-2">{getPolicy(c.policyId)?.name}</td>
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
                                <td colSpan={6} className="text-center text-muted-2 py-4">No claims in this category.</td>
                            </tr>
                            )}


                    </tbody>
                </table>

            </div>
            
            
            {active && (
                <ClaimReview claim={active} onClose={() => setActive(null)} onDecide={decide} getCustomer={getCustomer} getPolicy={getPolicy} />
            )}

        </div>
    )
}


function ClaimReview({ claim, onClose, onDecide, getCustomer, getPolicy}){
    return(
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
                            <p className="text-muted-2 small mb-1">Reason</p>
                            <p className="mb-0">{claim.reason}</p>
                        </div>
                        <div>
                            <p className="text-muted-2 small mb-2">Documents</p>
                            <div className="d-flex flex-wrap gap-2">
                            {claim.documents.map((doc) => (
                                <span key={doc} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 fw-normal">
                                <Paperclip size={12} /> {doc}
                                </span>
                            ))}
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted-2 small">Current status:</span>
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



function Field({label, value}){
    return(
        <div className="col-6">
            <p className="text-muted-2 mb-0" style={{ fontSize: "0.72rem" }}>{label}</p>
            <p className="fw-medium mb-0">{value}</p>
        </div>
    )
}