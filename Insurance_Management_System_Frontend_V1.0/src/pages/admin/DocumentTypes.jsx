import { useState } from "react"
import { Plus, Pencil, ShieldCheck, EyeOff, Eye } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { useData } from "../../lib/data-context.jsx"

const emptyForm = { id: "", name: "", category: "PURCHASE" }

export default function AdminDocumentTypes() {
  const { documentTypes, saveDocumentType, setDocumentTypeActive } = useData()
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState("")

  const purchaseTypes = documentTypes.filter((t) => t.category === "PURCHASE")
  const claimTypes = documentTypes.filter((t) => t.category === "CLAIM")

  async function handleSave(form) {
    setError("")
    try {
      await saveDocumentType(form)
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleActive(type) {
    await setDocumentTypeActive(type.id, !type.active)
  }

  return (
    <div>
      <PageHeader
        title="Document Types"
        description="Manage the document types admins can require for policy purchase or claim filing."
        action={
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setEditing(emptyForm)}>
            <Plus size={16} /> New Document Type
          </button>
        }
      />

      {error && <div className="alert alert-danger small py-2">{error}</div>}

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <TypeList title="Required for Purchase" types={purchaseTypes} onEdit={setEditing} onToggle={toggleActive} />
        </div>
        <div className="col-12 col-lg-6">
          <TypeList title="Required for Claims" types={claimTypes} onEdit={setEditing} onToggle={toggleActive} />
        </div>
      </div>

      {editing && <TypeModal initial={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  )
}

function TypeList({ title, types, onEdit, onToggle }) {
  return (
    <div className="card border-0 shadow-sm p-4 h-100">
      <h2 className="h6 fw-semibold mb-3">{title}</h2>
      <div className="d-flex flex-column gap-2">
        {types.map((type) => (
          <div key={type.id} className="border rounded p-2 d-flex align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2 min-w-0">
              <ShieldCheck size={16} className={type.active ? "text-primary" : "text-muted"} />
              <span className={`text-truncate ${type.active ? "" : "text-muted text-decoration-line-through"}`}>{type.name}</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <button className="btn btn-sm btn-link p-1" onClick={() => onEdit(type)} aria-label={`Edit ${type.name}`}>
                <Pencil size={14} />
              </button>
              <button
                className="btn btn-sm btn-link p-1 text-secondary"
                onClick={() => onToggle(type)}
                aria-label={type.active ? `Deactivate ${type.name}` : `Reactivate ${type.name}`}
              >
                {type.active ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}
        {types.length === 0 && <p className="text-muted small mb-0">No document types yet.</p>}
      </div>
    </div>
  )
}

function TypeModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial)
  const isEdit = Boolean(initial.id)

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function submit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Edit Document Type" : "New Document Type"}</h5>
                <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
              </div>
              <div className="modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-medium">Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Aadhaar Card" required />
                </div>
                <div>
                  <label className="form-label small fw-medium">Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => update("category", e.target.value)}>
                    <option value="PURCHASE">Required for Purchase</option>
                    <option value="CLAIM">Required for Claims</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEdit ? "Save Changes" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}
