import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, KeyRound, LogOut } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { Avatar } from "../../components/Avatar.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData } from "../../lib/data-context.jsx"

export default function CustomerProfile() {
  const { user, logout, changePassword } = useAuth()
  const { getCustomer } = useData()
  const navigate = useNavigate()
  const [savedProfile, setSavedProfile] = useState(false)
  const [savedPassword, setSavedPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const customer = getCustomer(user.id)

  function saveProfile(e) {
    e.preventDefault()
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 2500)
  }

  async function savePassword(e) {
    e.preventDefault()
    const form = e.currentTarget
    setPasswordError("")
    const fd = new FormData(form)
    const oldPassword = String(fd.get("oldPassword"))
    const newPassword = String(fd.get("newPassword"))
    const confirmPassword = String(fd.get("confirmPassword"))
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.")
      return
    }
    setChangingPassword(true)
    try {
      await changePassword(oldPassword, newPassword, confirmPassword)
      form.reset()
      setSavedPassword(true)
      setTimeout(() => setSavedPassword(false), 2500)
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  function handleLogout() {
    logout()
    navigate("/", { replace: true })
  }

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your account details and security." />

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="h6 fw-semibold d-flex align-items-center gap-2 mb-3">
              <User size={18} className="text-primary" /> Profile
            </h2>
            <div className="d-flex align-items-center gap-3 mb-4">
              <Avatar name={user.name} size={56} primary />
              <div>
                <p className="fw-medium mb-0">{user.name}</p>
                <p className="text-muted small mb-0 text-capitalize">{user.role}</p>
              </div>
            </div>
            {savedProfile && <div className="alert alert-success p-2 px-3 small mb-3">Profile updated successfully.</div>}
            <form onSubmit={saveProfile} className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-medium">Full Name</label>
                <input className="form-control" defaultValue={user.name} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Email</label>
                <input className="form-control" type="email" defaultValue={user.email} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Phone</label>
                <input className="form-control" defaultValue={customer?.phone ?? "+91 90000 00000"} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Address</label>
                <input className="form-control" defaultValue={customer?.address ?? "N/A"} />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">Update Profile</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 mb-3">
            <h2 className="h6 fw-semibold d-flex align-items-center gap-2 mb-3">
              <KeyRound size={18} className="text-primary" /> Change Password
            </h2>
            {savedPassword && <div className="alert alert-success p-2 px-3 small mb-3">Password updated.</div>}
            {passwordError && <div className="alert alert-danger p-2 px-3 small mb-3">{passwordError}</div>}
            <form onSubmit={savePassword} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-medium">Current Password</label>
                <input name="oldPassword" className="form-control" type="password" placeholder="********" required />
              </div>
              <div>
                <label className="form-label small fw-medium">New Password</label>
                <input name="newPassword" className="form-control" type="password" placeholder="********" required minLength={6} />
              </div>
              <div>
                <label className="form-label small fw-medium">Confirm New Password</label>
                <input name="confirmPassword" className="form-control" type="password" placeholder="********" required minLength={6} />
              </div>
              <button type="submit" className="btn btn-outline-primary w-100" disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          <div className="card border-0 shadow-sm p-4">
            <p className="text-muted small mb-3">Sign out of your account on this device.</p>
            <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
