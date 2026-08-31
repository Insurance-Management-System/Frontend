import { useEffect, useMemo, useState } from "react"
import { FileUp, Paperclip, RefreshCw } from "lucide-react"
import { StatusBadge } from "./StatusBadge.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import { useData } from "../lib/data-context.jsx"

export function latestDocumentsByType(documents) {
  const map = new Map()
  for (const doc of documents) {
    const key = doc.documentType.toLowerCase()
    if (!map.has(key)) {
      map.set(key, doc)
    }
  }
  return map
}

export function DocumentPanel({ title, referenceType, referenceId, requiredDocuments = [], compact = false }) {
  const { user } = useAuth()
  const { listDocuments, uploadDocument } = useData()
  const [documents, setDocuments] = useState([])
  const [uploadingTypeId, setUploadingTypeId] = useState(null)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const required = useMemo(() => requiredDocuments.filter((d) => d && d.name), [requiredDocuments])
  const latestByType = useMemo(() => latestDocumentsByType(documents), [documents])
  const allVerified = required.every((doc) => latestByType.get(doc.name.toLowerCase())?.verificationStatus === "VERIFIED")

  async function load() {
    if (!referenceType || !referenceId) return
    setDocuments(await listDocuments(referenceType, referenceId))
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))

    const poll = setInterval(() => {
      load().catch(() => {})
    }, 10000)

    function onFocus() {
      load().catch(() => {})
    }
    window.addEventListener("focus", onFocus)

    return () => {
      clearInterval(poll)
      window.removeEventListener("focus", onFocus)
    }
  }, [referenceType, referenceId])

  async function submit(type) {
    if (!file) return
    setBusy(true)
    setError("")
    try {
      await uploadDocument({ referenceType, referenceId, documentType: type.name, uploadedBy: user.id, file })
      setFile(null)
      setUploadingTypeId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`card border-0 shadow-sm ${compact ? "p-3" : "p-4"}`}>
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h6 fw-semibold mb-0 d-flex align-items-center gap-2">
          <Paperclip size={18} className="text-primary" /> {title}
        </h2>
        <button className="btn btn-sm btn-light" type="button" onClick={() => load()}>
          <RefreshCw size={14} />
        </button>
      </div>

      {error && <div className="alert alert-danger small py-2">{error}</div>}

      <div className="d-flex flex-column gap-2">
        {required.map((type) => {
          const latest = latestByType.get(type.name.toLowerCase())
          const status = latest?.verificationStatus ?? "MISSING"
          const isUploading = uploadingTypeId === type.id
          return (
            <div key={type.id} className="border rounded p-2">
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="min-w-0">
                  <p className="small fw-medium mb-0 text-truncate">{type.name}</p>
                  {latest && <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>{latest.originalFileName}</p>}
                  {status === "REJECTED" && latest?.remarks && (
                    <p className="text-danger mb-0" style={{ fontSize: "0.72rem" }}>Reason: {latest.remarks}</p>
                  )}
                  {status === "PENDING" && (
                    <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>Under admin review - cannot be edited right now.</p>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <StatusBadge
                    status={status === "VERIFIED" ? "Approved" : status === "REJECTED" ? "Rejected" : status === "PENDING" ? "Pending" : "Missing"}
                  />
                  {(status === "MISSING" || status === "REJECTED") && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                      onClick={() => { setUploadingTypeId(isUploading ? null : type.id); setFile(null) }}
                    >
                      {status === "REJECTED" ? "Replace" : "Upload"}
                    </button>
                  )}
                </div>
              </div>
              {isUploading && (
                <div className="d-flex gap-2 mt-2">
                  <input
                    className="form-control form-control-sm"
                    type="file"
                    accept=".pdf,image/*,video/mp4,video/quicktime"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1 text-nowrap"
                    disabled={busy || !file}
                    onClick={() => submit(type)}
                  >
                    <FileUp size={14} /> Save
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {required.length === 0 && <p className="text-muted small mb-0">No documents required.</p>}
      </div>

      {required.length > 0 && !allVerified && (
        <p className="text-danger small mb-0 mt-3">All required documents must be verified before you can continue.</p>
      )}
    </div>
  )
}
