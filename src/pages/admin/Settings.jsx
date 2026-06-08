import { useState } from "react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { Avatar } from "../../components/Avatar.jsx"
import { useAuth } from "../../lib/auth-context.jsx"

export default function AdminSettings() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  function save(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your admin account and platform preferences." />

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="h6 fw-semibold mb-3">Profile</h2>
            <div className="d-flex align-items-center gap-3 mb-4">
              <Avatar name={user.name} size={56} primary />
              <div>
                <p className="fw-medium mb-0">{user.name}</p>
                <p className="text-muted small mb-0">Administrator</p>
              </div>
            </div>
            {saved && <div className="alert alert-success p-2 px-3 small mb-3">Settings saved successfully.</div>}
            <form onSubmit={save} className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-medium">Full Name</label>
                <input className="form-control" defaultValue={user.name} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Email</label>
                <input className="form-control" defaultValue={user.email} type="email" />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Phone</label>
                <input className="form-control" defaultValue="+91 98000 11122" />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Role</label>
                <input className="form-control" defaultValue="Administrator" disabled />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="h6 fw-semibold mb-3">Preferences</h2>
            <div className="d-flex flex-column gap-3">
              <Toggle id="t1" label="Email notifications" hint="Receive claim and payment alerts" defaultChecked />
              <Toggle id="t2" label="Auto-approve small claims" hint="Claims under Rs. 10,000" />
              <Toggle id="t3" label="Weekly revenue report" hint="Every Monday morning" defaultChecked />
              <Toggle id="t4" label="Two-factor authentication" hint="Extra security on login" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Toggle({ id, label, hint, defaultChecked }) {
  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>
        <label htmlFor={id} className="fw-medium small mb-0">{label}</label>
        <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>{hint}</p>
      </div>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id={id} defaultChecked={defaultChecked} role="switch" />
      </div>
    </div>
  )
}
