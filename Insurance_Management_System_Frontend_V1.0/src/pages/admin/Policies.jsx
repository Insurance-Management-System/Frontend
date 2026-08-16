import { useState } from "react"
import { Plus, Pencil, Heart, HeartPulse, Car, Plane, ShieldCheck, Ban, RotateCcw, Trash2 } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
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
  categoryId: "",
  coverage: "",
  premium: "",
  durationValue: 1,
  durationUnit: "YEARS",
  paymentIntervalMonths: 12,
  description: "",
  benefits: "",
  purchaseDocumentTypeIds: [],
  claimDocumentTypeIds: [],
}

export default function AdminPolicies() {
  const { policies, categories, documentTypes, savePolicy, setPolicyActive, saveCategory, deleteCategory } = useData()
  const [editing, setEditing] = useState(null)
  const [categoryName, setCategoryName] = useState("")

  function openCreate() {
    setEditing({ ...emptyForm, categoryId: categories[0]?.id ?? "" })
  }

  function openEdit(policy) {
    setEditing({
      ...policy,
      categoryId: categories.find((c) => c.name === policy.type)?.id ?? "",
      benefits: policy.benefits.join("\n"),
      durationValue: policy.durationValue ?? 1,
      durationUnit: policy.durationUnit ?? "YEARS",
      paymentIntervalMonths: policy.paymentIntervalMonths ?? 12,
      purchaseDocumentTypeIds: (policy.requiredPurchaseDocuments ?? []).map((d) => d.id),
      claimDocumentTypeIds: (policy.requiredClaimDocuments ?? []).map((d) => d.id),
    })
  }

  async function handleSave(form) {
    await savePolicy({
      id: form.id || "",
      name: form.name,
      categoryId: form.categoryId,
      coverage: Number(form.coverage),
      premium: Number(form.premium),
      durationValue: Number(form.durationValue),
      durationUnit: form.durationUnit,
      paymentIntervalMonths: Number(form.paymentIntervalMonths),
      description: form.description,
      benefits: form.benefits.split("\n").map((b) => b.trim()).filter(Boolean),
      purchaseDocumentTypeIds: form.purchaseDocumentTypeIds.map(Number),
      claimDocumentTypeIds: form.claimDocumentTypeIds.map(Number),
    })
    setEditing(null)
  }

  async function addCategory(e) {
    e.preventDefault()
    await saveCategory({ name: categoryName, description: `${categoryName} insurance products` })
    setCategoryName("")
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

      <div className="card border-0 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div>
            <h2 className="h6 fw-semibold mb-1">Categories</h2>
            <p className="text-muted small mb-0">Manage policy categories before creating plans.</p>
          </div>
          <form className="d-flex gap-2" onSubmit={addCategory}>
            <input className="form-control" placeholder="New category" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
            <button className="btn btn-primary text-nowrap" type="submit"><Plus size={15} /> Add</button>
          </form>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
          {categories.map((c) => (
            <span key={c.id} className="badge text-bg-light border d-inline-flex align-items-center gap-2 p-2">
              {c.name}
              <button className="btn btn-sm btn-link p-0 text-danger" onClick={() => deleteCategory(c.id)} aria-label={`Delete ${c.name}`}>
                <Trash2 size={13} />
              </button>
            </span>
          ))}
        </div>
      </div>

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
                  <div className="d-flex gap-2">
                    {!policy.active && <StatusBadge status="Inactive" />}
                    <span className="badge text-bg-light border text-primary">{policy.type}</span>
                  </div>
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
                    <p className="fw-semibold mb-0">{formatINR(policy.installmentAmount)}<span className="text-muted fw-normal" style={{ fontSize: "0.72rem" }}>/{policy.paymentFrequencyLabel}</span></p>
                  </div>
                </div>
                <p className="text-muted mb-3" style={{ fontSize: "0.72rem" }}>
                  {formatINR(policy.premium)} total over {policy.duration} term
                </p>
                <button
                  className="btn btn-outline-primary btn-sm mt-auto d-flex align-items-center justify-content-center gap-2"
                  onClick={() => openEdit(policy)}
                >
                  <Pencil size={14} /> Edit Plan
                </button>
                {policy.active ? (
                  <button
                    className="btn btn-outline-danger btn-sm mt-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setPolicyActive(policy.id, false)}
                  >
                    <Ban size={14} /> Deactivate Plan
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-success btn-sm mt-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setPolicyActive(policy.id, true)}
                  >
                    <RotateCcw size={14} /> Activate Plan
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <PolicyModal initial={editing} categories={categories} documentTypes={documentTypes} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </div>
  )
}

const frequencyLabels = { 1: "Month", 3: "Quarter", 6: "Half-Year", 12: "Year" }

function PolicyModal({ initial, categories, documentTypes, onClose, onSave }) {
  const [form, setForm] = useState(initial)
  const isEdit = Boolean(initial.id)

  const termMonths = form.durationUnit === "YEARS" ? Number(form.durationValue || 0) * 12 : Number(form.durationValue || 0)
  const intervalMonths = Number(form.paymentIntervalMonths || 0)
  const totalInstallments = intervalMonths > 0 ? Math.max(1, Math.floor(termMonths / intervalMonths)) : 0
  const installmentPreview =
    form.premium && totalInstallments > 0
      ? `${formatINR(Number(form.premium) / totalInstallments)} / ${frequencyLabels[intervalMonths] ?? "installment"}`
      : ""

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleDocumentType(field, id) {
    setForm((f) => {
      const current = f[field]
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
      return { ...f, [field]: next }
    })
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
            <form onSubmit={submit} className="d-flex flex-column" style={{ minHeight: 0 }}>
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
                    <select className="form-select" value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-medium">Coverage (Rs.)</label>
                    <input type="number" className="form-control" value={form.coverage} onChange={(e) => update("coverage", e.target.value)} required />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-4">
                    <label className="form-label small fw-medium">Policy Term</label>
                    <input type="number" min={1} className="form-control" value={form.durationValue} onChange={(e) => update("durationValue", e.target.value)} required />
                  </div>
                  <div className="col-4">
                    <label className="form-label small fw-medium">Term Unit</label>
                    <select className="form-select" value={form.durationUnit} onChange={(e) => update("durationUnit", e.target.value)}>
                      <option value="MONTHS">Months</option>
                      <option value="YEARS">Years</option>
                    </select>
                  </div>
                  <div className="col-4">
                    <label className="form-label small fw-medium">Total Premium (Rs.)</label>
                    <input type="number" className="form-control" value={form.premium} onChange={(e) => update("premium", e.target.value)} required />
                    <p className="form-text mb-0">Total cost over the full policy term.</p>
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-medium">Premium Payment Frequency</label>
                  <select className="form-select" value={form.paymentIntervalMonths} onChange={(e) => update("paymentIntervalMonths", e.target.value)}>
                    <option value={1}>Monthly</option>
                    <option value={3}>Quarterly</option>
                    <option value={6}>Half-Yearly</option>
                    <option value={12}>Yearly</option>
                  </select>
                  <p className="form-text mb-0">
                    How often the premium is collected within the policy term.
                    {installmentPreview && ` Customers will pay ${installmentPreview} per installment.`}
                  </p>
                </div>
                <div>
                  <label className="form-label small fw-medium">Description</label>
                  <textarea className="form-control" rows={2} value={form.description} onChange={(e) => update("description", e.target.value)} required />
                </div>
                <div>
                  <label className="form-label small fw-medium">Benefits (one per line)</label>
                  <textarea className="form-control" rows={4} value={form.benefits} onChange={(e) => update("benefits", e.target.value)} />
                </div>
                <DocumentTypeChecklist
                  label="Documents required before purchase"
                  hint="Customers upload these documents first. They can pay only after an admin verifies every one."
                  types={documentTypes.filter((t) => t.category === "PURCHASE" && t.active)}
                  selectedIds={form.purchaseDocumentTypeIds}
                  onToggle={(id) => toggleDocumentType("purchaseDocumentTypeIds", id)}
                />
                <DocumentTypeChecklist
                  label="Documents required to file a claim"
                  hint="Shown to the customer when they file a claim on this policy."
                  types={documentTypes.filter((t) => t.category === "CLAIM" && t.active)}
                  selectedIds={form.claimDocumentTypeIds}
                  onToggle={(id) => toggleDocumentType("claimDocumentTypeIds", id)}
                />
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

function DocumentTypeChecklist({ label, hint, types, selectedIds, onToggle }) {
  const [filter, setFilter] = useState("")
  const visible = types.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <label className="form-label small fw-medium">{label}</label>
      {types.length > 6 && (
        <input
          className="form-control form-control-sm mb-2"
          placeholder="Search document types..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      )}
      <div className="border rounded p-2 d-flex flex-column gap-1" style={{ maxHeight: 160, overflowY: "auto" }}>
        {visible.map((type) => (
          <label key={type.id} className="form-check d-flex align-items-center gap-2 mb-0 small">
            <input
              type="checkbox"
              className="form-check-input"
              checked={selectedIds.includes(type.id)}
              onChange={() => onToggle(type.id)}
            />
            {type.name}
          </label>
        ))}
        {visible.length === 0 && <p className="text-muted small mb-0">No document types match.</p>}
      </div>
      <p className="form-text mb-0">{hint}</p>
    </div>
  )
}
