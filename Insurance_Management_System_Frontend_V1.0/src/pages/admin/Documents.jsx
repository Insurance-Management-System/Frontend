import { useEffect, useState } from "react"
import { AlertTriangle, Check, FileText, Loader2, RefreshCw, ShieldCheck, Sparkles, User, X } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { Avatar } from "../../components/Avatar.jsx"
import { latestDocumentsByType } from "../../components/DocumentPanel.jsx"
import { useData } from "../../lib/data-context.jsx"

const sections = [
  { key: "kyc", label: "KYC Documents" },
  { key: "purchase", label: "Purchase Documents" },
  { key: "claim", label: "Claim Documents" },
]

function pendingCount(customer) {
  return sections.reduce((sum, s) => {
    const latest = [...latestDocumentsByType(customer[s.key] ?? []).values()]
    return sum + latest.filter((d) => d.verificationStatus === "PENDING").length
  }, 0)
}

export default function AdminDocuments() {
  const { listDocumentsByCustomer, verifyDocument, recordDocumentDecision } = useData()
  const [customers, setCustomers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [active, setActive] = useState(null)
  const [syncWarning, setSyncWarning] = useState("")

  async function load() {
    const data = await listDocumentsByCustomer()
    setCustomers(data)
    if (!selectedId && data.length > 0) {
      setSelectedId(data[0].customerId)
    }
  }

  useEffect(() => {
    load().catch(() => setCustomers([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = customers.find((c) => c.customerId === selectedId)

  async function decide(doc, status, remarks = "") {
    await verifyDocument(doc.id, status, remarks)
    setSyncWarning("")
    try {
      await recordDocumentDecision({
        referenceType: doc.referenceType,
        referenceId: doc.referenceId,
        documentType: doc.documentType,
        status,
        remarks,
      })
    } catch (err) {
      setSyncWarning(
        `The document was marked ${status.toLowerCase()}, but updating the customer's KYC status / sending their notification failed (${err.message}). The customer may not see this reflected yet.`
      )
    }
    setActive(null)
    await load()
  }

  return (
    <div>
      <PageHeader
        title="Document Verification"
        description="Review KYC, policy purchase and claim documents by customer."
        action={<button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={load}><RefreshCw size={16} /> Refresh</button>}
      />

      {syncWarning && <div className="alert alert-warning py-2 small">{syncWarning}</div>}

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-2" style={{ maxHeight: 560, overflowY: "auto" }}>
            {customers.map((c) => {
              const pending = pendingCount(c)
              return (
                <button
                  key={c.customerId}
                  className={`btn w-100 text-start d-flex align-items-center justify-content-between gap-2 mb-1 ${selectedId === c.customerId ? "btn-primary" : "btn-light"}`}
                  onClick={() => setSelectedId(c.customerId)}
                >
                  <span className="d-flex align-items-center gap-2 text-truncate">
                    <Avatar name={c.customerName} size={28} />
                    <span className="text-truncate">{c.customerName}</span>
                  </span>
                  {pending > 0 && <span className="badge text-bg-warning">{pending}</span>}
                </button>
              )
            })}
            {customers.length === 0 && <p className="text-muted small p-3 mb-0">No documents uploaded yet.</p>}
          </div>
        </div>

        <div className="col-12 col-lg-8">
          {!selected ? (
            <div className="card border-0 shadow-sm p-5 text-center text-muted">
              <User size={32} className="mx-auto mb-2" />
              Select a customer to review their documents.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {sections.map((section) => {
                const latest = [...latestDocumentsByType(selected[section.key] ?? []).values()]
                return (
                  <div key={section.key} className="card border-0 shadow-sm p-4">
                    <h2 className="h6 fw-semibold mb-3">{section.label}</h2>
                    {latest.length === 0 ? (
                      <p className="text-muted small mb-0">Nothing uploaded.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Document</th>
                              <th className="d-none d-md-table-cell">File</th>
                              <th>Status</th>
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {latest.map((doc) => (
                              <tr key={doc.id}>
                                <td className="fw-medium">{doc.documentType}</td>
                                <td className="d-none d-md-table-cell text-muted">{doc.originalFileName}</td>
                                <td><StatusBadge status={toUiStatus(doc.verificationStatus)} /></td>
                                <td className="text-end">
                                  <button className="btn btn-sm btn-link text-primary text-decoration-none" onClick={() => setActive(doc)}>Review</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {active && <ReviewModal document={active} onClose={() => setActive(null)} onDecide={decide} />}
    </div>
  )
}

function ReviewModal({ document, onClose, onDecide }) {
  const { getDocument, analyzeDocument } = useData()
  const [remarks, setRemarks] = useState("")
  const [fullDoc, setFullDoc] = useState(null)
  const [loadingDoc, setLoadingDoc] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoadingDoc(true)
    getDocument(document.id)
      .then((doc) => {
        if (!cancelled) setFullDoc(doc)
      })
      .catch(() => {
        if (!cancelled) setFullDoc(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingDoc(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id])

  async function runAnalysis() {
    setAnalyzing(true)
    setAnalysisError("")
    try {
      const result = await analyzeDocument(document.id)
      setFullDoc(result)
    } catch (err) {
      setAnalysisError(err.message || "AI analysis failed. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const aiAnalysis = fullDoc?.aiAnalysis ?? null

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <FileText size={18} className="text-primary" /> {document.documentType}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body d-flex flex-column gap-3" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <Field label="Reference" value={`${document.referenceType} #${document.referenceId}`} />
              <Field label="Uploaded File" value={document.originalFileName} />
              <div className="d-flex flex-wrap gap-2">
                <a className="btn btn-sm btn-outline-primary" href={`${import.meta.env.VITE_DOCUMENT_API_URL ?? "http://localhost:8084/api/documents"}/${document.id}/file`} target="_blank" rel="noreferrer">Open uploaded file</a>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={runAnalysis}
                  disabled={analyzing || loadingDoc}
                >
                  {analyzing ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                  {analyzing ? "Analyzing..." : aiAnalysis ? "Re-analyze with AI" : "Analyze with AI"}
                </button>
              </div>

              {analysisError && <div className="alert alert-danger py-2 mb-0 small">{analysisError}</div>}

              {!loadingDoc && !aiAnalysis && !analyzing && (
                <p className="text-muted small mb-0">No AI analysis yet. Click "Analyze with AI" to extract structured details from this document.</p>
              )}

              {aiAnalysis && <AnalysisPanel analysis={aiAnalysis} />}

              <div>
                <label className="form-label small fw-medium">Remarks</label>
                <textarea className="form-control" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={() => onDecide(document, "REJECTED", remarks)}>
                <X size={16} /> Reject
              </button>
              <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => onDecide(document, "VERIFIED", remarks)}>
                <Check size={16} /> Verify
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}

function AnalysisPanel({ analysis }) {
  const a = analysis.analysis
  if (!a) return null

  const fmtDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
  }

  return (
    <div className="card border-0 bg-light-subtle p-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h3 className="h6 fw-semibold mb-0 d-flex align-items-center gap-2">
          <Sparkles size={16} className="text-primary" /> AI Analysis
        </h3>
        <div className="d-flex align-items-center gap-2">
          <ConfidenceBadge level={a.overallConfidence} />
          {analysis.analyzedAt && <span className="text-muted" style={{ fontSize: "0.72rem" }}>{fmtDate(analysis.analyzedAt)}</span>}
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6">
          <Field label="Document Type" value={a.documentType} confidence={a.documentTypeConfidence} />
        </div>
        <div className="col-6">
          <Field label="Language" value={a.language} confidence={a.languageConfidence} />
        </div>
      </div>

      {a.summary && (
        <div className="mb-3">
          <p className="text-muted mb-1" style={{ fontSize: "0.72rem" }}>Summary</p>
          <p className="mb-0 small">{a.summary}</p>
        </div>
      )}

      {a.extractedInformation && (
        <div className="mb-3">
          <p className="text-muted mb-1" style={{ fontSize: "0.72rem" }}>Extracted Information</p>
          <p className="mb-0 small" style={{ whiteSpace: "pre-wrap" }}>{a.extractedInformation}</p>
        </div>
      )}

      {a.structuredFields?.length > 0 && (
        <AnalysisTable title="Structured Fields" rows={a.structuredFields} labelKey="field" />
      )}
      {a.ids?.length > 0 && <AnalysisTable title="ID Numbers" rows={a.ids} labelKey="label" />}
      {a.importantDates?.length > 0 && <AnalysisTable title="Important Dates" rows={a.importantDates} labelKey="label" />}
      {a.importantNumbers?.length > 0 && <AnalysisTable title="Important Numbers" rows={a.importantNumbers} labelKey="label" />}
      {a.referenceNumbers?.length > 0 && <AnalysisTable title="Reference Numbers" rows={a.referenceNumbers} labelKey="label" />}

      {a.names?.length > 0 && <TagList title="Names" items={a.names} />}
      {a.addresses?.length > 0 && <TagList title="Addresses" items={a.addresses} />}
      {a.entities?.length > 0 && <TagList title="Entities" items={a.entities} />}
      {a.financialInformation?.length > 0 && <TagList title="Financial Information" items={a.financialInformation} />}
      {a.medicalInformation?.length > 0 && <TagList title="Medical Information" items={a.medicalInformation} />}
      {a.observations?.length > 0 && <TagList title="Observations" items={a.observations} />}

      {a.fieldsRequiringManualVerification?.length > 0 && (
        <div className="alert alert-warning py-2 mb-0">
          <p className="fw-semibold mb-2 d-flex align-items-center gap-2 small">
            <AlertTriangle size={14} /> Requires Manual Verification
          </p>
          <ul className="mb-0 small ps-3">
            {a.fieldsRequiringManualVerification.map((item, idx) => (
              <li key={idx}>
                <strong>{item.field}:</strong> {item.value} <span className="text-muted">- {item.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.sourceType === "pdf" && (
        <p className="text-muted mb-0 mt-2" style={{ fontSize: "0.7rem" }}>
          <ShieldCheck size={12} className="me-1" />
          PDF converted to {analysis.pagesAnalyzed} page image{analysis.pagesAnalyzed === 1 ? "" : "s"} for analysis
          {analysis.truncated ? ` (of ${analysis.totalPages} total pages - only the first ${analysis.pagesAnalyzed} were analyzed)` : ""}.
        </p>
      )}
    </div>
  )
}

function AnalysisTable({ title, rows, labelKey }) {
  return (
    <div className="mb-3">
      <p className="text-muted mb-1" style={{ fontSize: "0.72rem" }}>{title}</p>
      <div className="table-responsive">
        <table className="table table-sm mb-0">
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="text-muted small" style={{ width: "40%" }}>{row[labelKey]}</td>
                <td className="small">{row.value}</td>
                <td className="text-end" style={{ width: 90 }}><ConfidenceBadge level={row.confidence} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TagList({ title, items }) {
  return (
    <div className="mb-3">
      <p className="text-muted mb-1" style={{ fontSize: "0.72rem" }}>{title}</p>
      <div className="d-flex flex-wrap gap-1">
        {items.map((item, idx) => (
          <span key={idx} className="badge text-bg-light border small fw-normal">{item}</span>
        ))}
      </div>
    </div>
  )
}

const confidenceStyles = {
  HIGH: "text-bg-success",
  MEDIUM: "text-bg-warning",
  LOW: "text-bg-danger",
}

function ConfidenceBadge({ level }) {
  if (!level) return null
  return <span className={`badge rounded-pill ${confidenceStyles[level] || "text-bg-secondary"}`} style={{ fontSize: "0.65rem" }}>{level}</span>
}

function Field({ label, value, confidence }) {
  return (
    <div>
      <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>{label}</p>
      <p className="fw-medium mb-0 text-break d-flex align-items-center gap-2">
        {value || "N/A"}
        {confidence && <ConfidenceBadge level={confidence} />}
      </p>
    </div>
  )
}

function toUiStatus(status) {
  if (status === "VERIFIED") return "Approved"
  if (status === "REJECTED") return "Rejected"
  return "Pending"
}
