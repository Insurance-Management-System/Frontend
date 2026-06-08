import { useState } from "react"
import { Plus, Pencil, Heart, HeartPulse, Car, Plane, ShieldCheck } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const typeIcons = {
  Health: HeartPulse,
  Life: Heart,
  Vehicle: Car,
  Travel: Plane,
}

const emptyForm = {
  id: "",
  name: "",
  type: "Health",
  coverage: "",
  premium: "",
  duration: "1 Year",
  description: "",
  benefits: "",
}

export default function AdminPolicies() {
  const { policies, savePolicy } = useData()
  const [editing, setEditing] = useState(null)

  function openCreate() {
    setEditing(emptyForm)
  }

  function openEdit(policy) {
    setEditing({ ...policy, benefits: policy.benefits.join("\n") })
  }

  function handleSave(form) {
    savePolicy({
      id: form.id || `p${Date.now()}`,
      name: form.name,
      type: form.type,
      coverage: Number(form.coverage),
      premium: Number(form.premium),
      duration: form.duration,
      description: form.description,
      benefits: form.benefits.split("\n").map((b) => b.trim()).filter(Boolean),
    })
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="Policy Plans"
        description="Create and manage insurance plans offered to customers."
        action={
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> New Plan
          </button>
        }
      />

      <div className="row g-3">
        {policies.map((policy) => {
          const Icon = typeIcons[policy.type] || ShieldCheck
          return (
            <div key={policy.id} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100 p-4 d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="rounded bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center">
                    <Icon size={22} />
                  </div>
                  <span className="badge text-bg-light border text-primary">{policy.type}</span>
                </div>
                <h2 className="h6 fw-semibold mb-1">{policy.name}</h2>
                <p className="text-muted small mb-3" style={{ minHeight: 40 }}>{policy.description}</p>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>Coverage</p>
                    <p className="fw-semibold mb-0">{formatINR(policy.coverage)}</p>
                  </div>
                  <div className="col-6">
                    <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>Premium</p>
                    <p className="fw-semibold mb-0">{formatINR(policy.premium)}<span className="text-muted fw-normal" style={{ fontSize: "0.72rem" }}>/{policy.duration}</span></p>
                  </div>
                </div>
                <button
                  className="btn btn-outline-primary btn-sm mt-auto d-flex align-items-center justify-content-center gap-2"
                  onClick={() => openEdit(policy)}
                >
                  <Pencil size={14} /> Edit Plan
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {editing && <PolicyModal initial={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  )
}

function PolicyModal({ initial, onClose, onSave }) {
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
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Edit Plan" : "Create New Plan"}</h5>
                <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
              </div>
              <div className="modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-medium">Plan Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-medium">Type</label>
                    <select className="form-select" value={form.type} onChange={(e) => update("type", e.target.value)}>
                      <option>Health</option>
                      <option>Life</option>
                      <option>Vehicle</option>
                      <option>Travel</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-medium">Duration</label>
                    <input className="form-control" value={form.duration} onChange={(e) => update("duration", e.target.value)} required />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-medium">Coverage (Rs.)</label>
                    <input type="number" className="form-control" value={form.coverage} onChange={(e) => update("coverage", e.target.value)} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-medium">Premium (Rs.)</label>
                    <input type="number" className="form-control" value={form.premium} onChange={(e) => update("premium", e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-medium">Description</label>
                  <textarea className="form-control" rows={2} value={form.description} onChange={(e) => update("description", e.target.value)} required />
                </div>
                <div>
                  <label className="form-label small fw-medium">Benefits (one per line)</label>
                  <textarea className="form-control" rows={4} value={form.benefits} onChange={(e) => update("benefits", e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEdit ? "Save Changes" : "Create Plan"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}
