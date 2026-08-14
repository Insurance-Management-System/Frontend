import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { StatusBadge } from "./StatusBadge.jsx"
import { DocumentPanel } from "./DocumentPanel.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import { useData } from "../lib/data-context.jsx"

const initialForm = {
  dob: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  aadhaar: "",
  pan: "",
  occupation: "",
  annualIncome: "",
}

const kycStatusLabel = {
  NOT_STARTED: "Not started",
  PENDING_VERIFICATION: "Pending Verification",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
}

export function KycModal() {
  const { user } = useAuth()
  const { getCustomer, completeKyc, documentTypes } = useData()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const customer = user ? getCustomer(user.id) : null

  if (!customer) return null

  const requiredKycDocs = documentTypes.filter((t) => t.category === "KYC")
  const status = customer.kycStatus ?? "NOT_STARTED"

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError("")
    setSaving(true)
    try {
      await completeKyc({ ...form, pan: form.pan.toUpperCase(), aadhaar: form.aadhaar.replace(/\s/g, ""), annualIncome: Number(form.annualIncome) })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (status === "NOT_STARTED") {
    return (
      <div className="card border-0 shadow-sm p-4">
        <h2 className="h6 fw-semibold d-flex align-items-center gap-2 mb-1">
          <ShieldCheck size={18} className="text-primary" /> Complete your KYC
        </h2>
        <p className="text-muted small mb-3">
          Required once, before your first policy purchase. Fill in your details and upload Aadhaar + PAN below.
        </p>
        <form onSubmit={submit} className="d-flex flex-column gap-3">
          {error && <div className="alert alert-danger small py-2">{error}</div>}
          <div className="row g-3">
            <Field label="Date of Birth"><input className="form-control" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} required /></Field>
            <Field label="Gender"><select className="form-select" value={form.gender} onChange={(e) => update("gender", e.target.value)} required><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></Field>
            <Field label="Aadhaar Number"><input className="form-control" inputMode="numeric" maxLength="12" value={form.aadhaar} onChange={(e) => update("aadhaar", e.target.value)} placeholder="12-digit Aadhaar" required /></Field>
            <Field label="PAN Number"><input className="form-control text-uppercase" maxLength="10" value={form.pan} onChange={(e) => update("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" required /></Field>
            <div className="col-12"><label className="form-label small fw-medium">Address</label><textarea className="form-control" rows="2" value={form.address} onChange={(e) => update("address", e.target.value)} required /></div>
            <Field label="City"><input className="form-control" value={form.city} onChange={(e) => update("city", e.target.value)} required /></Field>
            <Field label="State"><input className="form-control" value={form.state} onChange={(e) => update("state", e.target.value)} required /></Field>
            <Field label="Pincode"><input className="form-control" inputMode="numeric" maxLength="6" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} required /></Field>
            <Field label="Occupation"><input className="form-control" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} required /></Field>
            <Field label="Annual Income (INR)"><input className="form-control" type="number" min="1" value={form.annualIncome} onChange={(e) => update("annualIncome", e.target.value)} required /></Field>
          </div>
          <button className="btn btn-primary align-self-start" type="submit" disabled={saving}>{saving ? "Saving…" : "Save and Continue to Documents"}</button>
        </form>
      </div>
    )
  }

  return (
    <div className="card border-0 shadow-sm p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h6 fw-semibold d-flex align-items-center gap-2 mb-0">
          <ShieldCheck size={18} className="text-primary" /> KYC Status
        </h2>
        <StatusBadge status={kycStatusLabel[status] ?? status} />
      </div>
      {status === "PENDING_VERIFICATION" && (
        <p className="text-muted small mb-3">Your KYC documents are awaiting admin verification. You can't purchase a policy until they're approved.</p>
      )}
      {status === "REJECTED" && (
        <p className="text-danger small mb-3">Your KYC documents were rejected. Please replace them below.</p>
      )}
      {status === "VERIFIED" && (
        <p className="text-success small mb-3">Your KYC is verified. Replacing a document will send it back for re-verification.</p>
      )}
      <DocumentPanel
        title="KYC Documents"
        referenceType="KYC"
        referenceId={user.id}
        requiredDocuments={requiredKycDocs}
        compact
      />
    </div>
  )
}

function Field({ label, children }) {
  return <div className="col-md-6"><label className="form-label small fw-medium">{label}</label>{children}</div>
}
